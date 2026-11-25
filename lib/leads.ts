import { adminClient } from "@/lib/portal/supabase";
import { portalEnabled } from "@/lib/portal/config";
import { mailerEnabled, sendMail } from "@/lib/mailer";
import { site } from "@/lib/site";

// Every website form submission is saved to the portal database first (so a
// lead is never lost), then an email alert goes out. If the optional Google
// Apps Script webhook is configured, the lead is copied there too.

type Fields = Record<string, unknown>;

const s = (v: unknown) => (typeof v === "string" ? v.trim() : v == null ? "" : String(v));

function pick(f: Fields, keys: string[]) {
  for (const k of keys) if (s(f[k])) return s(f[k]);
  return "";
}

const labels: Record<string, string> = {
  monthlyIncome: "Monthly income",
  timeAtJob: "Time at job",
  timeAtAddress: "Time at address",
  vehicleWanted: "Vehicle wanted",
  language: "Language",
  utmSource: "Source",
  utmMedium: "Medium",
  utmCampaign: "Campaign",
  utmContent: "Ad / post",
  referrer: "Referrer",
  landingPage: "Landing page",
};

export function leadSummary(fields: Fields) {
  return Object.entries(fields)
    .filter(([k, v]) => s(v) && !["contactConsent"].includes(k))
    .map(([k, v]) => `${labels[k] ?? k.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase())}: ${s(v)}`)
    .join("\n");
}

async function saveLead(form: string, fields: Fields, page: string) {
  if (!portalEnabled()) return null;
  const { data, error } = await adminClient()
    .from("leads")
    .insert({
      form,
      name: pick(fields, ["name", "contactName", "sellerName"]) || null,
      phone: pick(fields, ["phone"]) || null,
      email: pick(fields, ["email"]) || null,
      fields,
      page: page || null,
    })
    .select("id")
    .single();
  if (error) {
    console.error("lead save failed", error.message);
    return null;
  }
  return data.id as string;
}

async function alertLead(form: string, fields: Fields) {
  if (!mailerEnabled()) return false;
  const name = pick(fields, ["name", "contactName", "sellerName"]) || "Unknown";
  const phone = pick(fields, ["phone"]);
  const extra =
    form === "RTO Pre-Qualification" ? ` – ${s(fields.monthlyIncome) || "income not given"}` : "";
  const text = [
    `New ${form} from the website.`,
    "",
    leadSummary(fields),
    "",
    phone ? `Call or text: ${phone}` : "",
    `All leads: ${site.url}/portal/admin/leads`,
  ]
    .filter((line) => line !== null)
    .join("\n");
  return sendMail({
    to: process.env.LEADS_ALERT_EMAIL || site.email,
    subject: `New lead: ${name}${extra} (${form})`,
    text,
    replyTo: pick(fields, ["email"]) || undefined,
  });
}

async function forwardToSheet(form: string, fields: Fields, page: string) {
  const url = process.env.LEADS_WEBHOOK_URL;
  const secret = process.env.LEADS_WEBHOOK_SECRET;
  if (!url || !secret) return false;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret, form, submittedAt: new Date().toISOString(), page, fields }),
      redirect: "follow",
      signal: controller.signal,
    });
    const data = (await response.json().catch(() => null)) as { ok?: boolean } | null;
    return response.ok && data?.ok === true;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

// Returns true when the lead was kept somewhere we can see it.
export async function forwardLead(form: string, fields: Fields, request: Request): Promise<boolean> {
  const page = request.headers.get("referer") ?? "";
  const id = await saveLead(form, fields, page);
  const [alerted, forwarded] = await Promise.all([
    alertLead(form, fields).catch(() => false),
    forwardToSheet(form, fields, page),
  ]);
  if (id && alerted) {
    await adminClient().from("leads").update({ alert_sent: true }).eq("id", id);
  }
  return Boolean(id) || alerted || forwarded;
}
