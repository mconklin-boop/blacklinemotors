import { adminClient } from "./supabase";
import { loadDocuments } from "./data";
import { adminAlertEmail, postAutoMessage } from "./applications";
import { sendMail } from "@/lib/mailer";
import { site } from "@/lib/site";
import type { AutoReview, Customer, ReviewCheck } from "./types";

// Reads the applicant's uploads with Claude, checks them against the
// rent-to-own rules, and approves clean passes automatically. Anything
// unclear goes to Michael. This never declines anyone.

export const RULES = {
  minMonthlyGrossCents: 300000,
  payStubMaxAgeDays: 45,
  residenceMaxAgeDays: 90,
  minDaysOnJob: 182,
};

export function autoReviewEnabled() {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

const MEDIA: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  pdf: "application/pdf",
};

type Extracted = {
  license?: { full_name?: string; expiration_date?: string; address?: string; readable?: boolean };
  pay_stubs?: {
    employee_name?: string;
    employer?: string;
    pay_date?: string;
    gross_pay_this_period?: number;
    pay_frequency?: string;
    hire_date?: string;
  }[];
  residence?: { name?: string; address?: string; document_date?: string; document_type?: string };
  concerns?: string[];
};

const PROMPT = `You are checking rent-to-own application documents for Blackline Motors.
Each document above is labeled with what the applicant said it is.
Extract the facts below exactly as printed. Do not guess: use null for anything you can't read.
Dates as YYYY-MM-DD. Money as plain numbers in dollars.
List in "concerns" anything that should make a person look closer: a document that isn't what it was labeled,
an unreadable or cut-off image, signs of editing (mismatched fonts, misaligned numbers, math that doesn't add up),
a name that differs between documents, or an expired license.
Reply with ONLY this JSON:
{"license":{"full_name":"","expiration_date":"","address":"","readable":true},
 "pay_stubs":[{"employee_name":"","employer":"","pay_date":"","gross_pay_this_period":0,"pay_frequency":"weekly|biweekly|semimonthly|monthly","hire_date":""}],
 "residence":{"name":"","address":"","document_date":"","document_type":""},
 "concerns":[]}`;

function words(name: string | null | undefined) {
  return (name ?? "")
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1);
}

// Same person if the last name matches and the first name or initial matches.
export function namesMatch(a: string | null | undefined, b: string | null | undefined) {
  const x = words(a);
  const y = words(b);
  if (!x.length || !y.length) return false;
  const lastMatch = y.includes(x[x.length - 1]) || x.includes(y[y.length - 1]);
  const firstMatch = y.some((w) => w[0] === x[0][0]);
  return lastMatch && firstMatch;
}

function daysAgo(date: string | null | undefined) {
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  return Math.floor((Date.now() - Date.parse(`${date}T12:00:00Z`)) / 86_400_000);
}

const PER_MONTH: Record<string, number> = { weekly: 52 / 12, biweekly: 26 / 12, semimonthly: 2, monthly: 1 };

function streetNumber(address: string | null | undefined) {
  return (address ?? "").match(/^\s*(\d+)/)?.[1] ?? null;
}

async function readDocuments(customer: Customer) {
  const docs = (await loadDocuments(customer.id)).filter((d) => d.kind);
  const db = adminClient();
  const content: unknown[] = [];
  const skipped: string[] = [];
  let n = 0;
  for (const d of docs) {
    const ext = d.storage_path.split(".").pop()?.toLowerCase() ?? "";
    const media = MEDIA[ext];
    if (!media) {
      skipped.push(`${d.title} (${ext || "unknown"} file type)`);
      continue;
    }
    const { data } = await db.storage.from("portal").download(d.storage_path);
    if (!data) {
      skipped.push(`${d.title} (couldn't open)`);
      continue;
    }
    const buf = Buffer.from(await data.arrayBuffer());
    if (buf.length > (media === "application/pdf" ? 20 : 5) * 1024 * 1024) {
      skipped.push(`${d.title} (file too large to read)`);
      continue;
    }
    n++;
    content.push({ type: "text", text: `Document ${n} — applicant labeled it: ${d.title}` });
    content.push(
      media === "application/pdf"
        ? { type: "document", source: { type: "base64", media_type: media, data: buf.toString("base64") } }
        : { type: "image", source: { type: "base64", media_type: media, data: buf.toString("base64") } },
    );
  }
  return { content, skipped, count: n };
}

async function askClaude(content: unknown[]): Promise<Extracted> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY ?? "",
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL || "claude-sonnet-5-5",
      max_tokens: 2000,
      messages: [{ role: "user", content: [...content, { type: "text", text: PROMPT }] }],
    }),
  });
  if (!res.ok) throw new Error(`Claude API ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const json = (await res.json()) as { content?: { type: string; text?: string }[] };
  const text = json.content?.find((c) => c.type === "text")?.text ?? "";
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("Claude didn't return JSON");
  return JSON.parse(match[0]) as Extracted;
}

export function evaluate(customer: Customer, x: Extracted, skipped: string[]) {
  const checks: ReviewCheck[] = [];
  const add = (label: string, ok: boolean, detail: string) => checks.push({ label, ok, detail });
  const name = customer.full_name;
  const lic = x.license ?? {};

  add("All documents readable", skipped.length === 0, skipped.length ? `Couldn't read: ${skipped.join(", ")}` : "Yes");
  add(
    "License name matches",
    lic.readable !== false && namesMatch(name, lic.full_name),
    `License: ${lic.full_name ?? "not found"} · Application: ${name}`,
  );
  const licExp = daysAgo(lic.expiration_date);
  add("License not expired", licExp !== null && licExp < 0, `Expires ${lic.expiration_date ?? "unknown"}`);

  const stubs = (x.pay_stubs ?? []).filter((s) => s.gross_pay_this_period && s.pay_frequency && PER_MONTH[s.pay_frequency]);
  const monthly = stubs.map((s) => (s.gross_pay_this_period as number) * PER_MONTH[s.pay_frequency as string]);
  const avgMonthlyCents = monthly.length ? Math.round((monthly.reduce((a, b) => a + b, 0) / monthly.length) * 100) : 0;
  add(
    "Income $3,000+/month gross",
    avgMonthlyCents >= RULES.minMonthlyGrossCents,
    monthly.length ? `About $${Math.round(avgMonthlyCents / 100).toLocaleString("en-US")}/month from ${monthly.length} pay stub(s)` : "No readable pay stub",
  );
  const newest = Math.min(...(x.pay_stubs ?? []).map((s) => daysAgo(s.pay_date) ?? 9999));
  add("Pay stub is recent", newest <= RULES.payStubMaxAgeDays, newest === 9999 ? "No pay date found" : `Newest stub ${newest} days old`);
  add(
    "Pay stub name matches",
    (x.pay_stubs ?? []).length > 0 && (x.pay_stubs ?? []).every((s) => namesMatch(name, s.employee_name)),
    (x.pay_stubs ?? []).map((s) => s.employee_name ?? "?").join(", ") || "None",
  );
  const hire = (x.pay_stubs ?? []).map((s) => daysAgo(s.hire_date)).find((d) => d !== null);
  const statedShort = customer.application.timeAtJob === "Less than 6 months";
  add(
    "6+ months at job",
    !statedShort && (hire === undefined || hire === null || hire >= RULES.minDaysOnJob),
    `Said: ${customer.application.timeAtJob ?? "—"}${hire != null ? ` · stub hire date ${Math.round(hire / 30)} months ago` : ""}`,
  );

  const res = x.residence ?? {};
  const resAge = daysAgo(res.document_date);
  add("Proof of residence is recent", resAge !== null && resAge <= RULES.residenceMaxAgeDays, `${res.document_type ?? "Document"} dated ${res.document_date ?? "unknown"}`);
  add("Residence name matches", namesMatch(name, res.name), `${res.name ?? "not found"}`);
  const sn = streetNumber(customer.address_line1);
  add(
    "Address matches application",
    !!sn && streetNumber(res.address) === sn,
    `Residence doc: ${res.address ?? "not found"} · Application: ${customer.address_line1 ?? "—"}`,
  );
  add("No red flags", !(x.concerns ?? []).length, (x.concerns ?? []).join("; ") || "None found");

  return { checks, passed: checks.every((c) => c.ok), avgMonthlyCents };
}

export async function runAutoReview(customerId: string, baseUrl: string) {
  const db = adminClient();
  const { data } = await db.from("customers").select("*").eq("id", customerId).maybeSingle();
  const customer = data as Customer | null;
  if (!customer || customer.stage !== "submitted") return;

  let review: AutoReview;
  try {
    const { content, skipped, count } = await readDocuments(customer);
    const extracted = count ? await askClaude(content) : {};
    const { checks, passed, avgMonthlyCents } = evaluate(customer, extracted, skipped);
    review = {
      ranAt: new Date().toISOString(),
      outcome: passed ? "approved" : "needs_review",
      summary: passed
        ? "Every check passed. Approved automatically."
        : `Needs your review: ${checks.filter((c) => !c.ok).map((c) => c.label).join(", ")}.`,
      checks,
      extracted: { ...extracted, verifiedMonthlyIncomeCents: avgMonthlyCents || null },
    };
  } catch (err) {
    review = {
      ranAt: new Date().toISOString(),
      outcome: "error",
      summary: `Automatic review didn't finish (${err instanceof Error ? err.message : "unknown error"}). Review manually.`,
      checks: [],
    };
  }

  const approve = review.outcome === "approved";
  await db
    .from("customers")
    .update(
      approve
        ? { review, stage: "approved", decided_at: new Date().toISOString(), decision_note: null }
        : { review },
    )
    .eq("id", customerId)
    .eq("stage", "submitted");

  const link = `${baseUrl}/portal/admin/customers/${customerId}#application`;
  const checkLines = review.checks.map((c) => `${c.ok ? "✓" : "✗"} ${c.label}: ${c.detail}`).join("\n");
  if (approve) {
    const msg =
      "Good news: you're approved for rent-to-own. We're finding vehicle options for you now. They'll show up in your portal, and you'll have 24 hours to pick one.";
    await postAutoMessage(customerId, msg);
    await sendMail({
      to: customer.email,
      fromName: site.name,
      subject: "You're approved for rent-to-own",
      text: `Hi ${customer.full_name.split(" ")[0]},\n\n${msg}\n\nYour portal: ${baseUrl}/portal\n\nBlackline Motors\n${site.phoneDisplay}`,
    });
  }
  await sendMail({
    to: adminAlertEmail(),
    fromName: "Blackline Portal",
    subject: approve
      ? `Auto-approved: ${customer.full_name}`
      : `Application needs your review: ${customer.full_name}`,
    text: `${review.summary}\n\n${checkLines}\n\nWants: ${customer.application.vehicleWanted ?? "—"}${customer.application.preferredModels ? ` (${customer.application.preferredModels})` : ""} · Budget: ${customer.application.budget ?? "—"}\n\nOpen: ${link}`,
  });
}
