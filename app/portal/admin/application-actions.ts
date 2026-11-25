"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/portal/session";
import { adminClient } from "@/lib/portal/supabase";
import { toCents } from "@/lib/portal/account";
import { OPTION_HOURS, optionName, postAutoMessage, prettyDateTime } from "@/lib/portal/applications";
import { sendMail } from "@/lib/mailer";
import { site } from "@/lib/site";
import type { Customer } from "@/lib/portal/types";

const q = encodeURIComponent;
const back = (customerId: string, key: "ok" | "error", msg: string): never =>
  redirect(`/portal/admin/customers/${customerId}?${key}=${q(msg)}#application`);

async function baseUrl() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "www.blacklinemotorsco.com";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

function str(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

async function loadCustomer(id: string) {
  const { data } = await adminClient().from("customers").select("*").eq("id", id).maybeSingle();
  return data as Customer | null;
}

// ---------- decision ----------

export async function decideApplication(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "customer_id");
  const decision = str(formData, "decision");
  const note = str(formData, "note").slice(0, 1000) || null;
  const customer = await loadCustomer(id);
  if (!customer) back(id, "error", "Customer not found.");
  const c = customer!;

  const stage =
    decision === "approve" ? "approved" : decision === "decline" ? "declined" : decision === "more_info" ? "applicant" : null;
  if (!stage) back(id, "error", "Pick a decision.");
  if (stage === "applicant" && !note) back(id, "error", "Say what else you need so the applicant knows.");

  const { error } = await adminClient()
    .from("customers")
    .update({ stage, decision_note: note, decided_at: new Date().toISOString() })
    .eq("id", id);
  if (error) back(id, "error", error.message);

  const first = c.full_name.split(" ")[0];
  const portal = `${await baseUrl()}/portal`;
  const text = {
    approved: {
      subject: "You're approved for rent-to-own",
      msg: `Good news: you're approved for rent-to-own.${note ? ` ${note}` : ""} We're finding vehicle options for you now. They'll show up in your portal, and you'll have 24 hours to pick one.`,
    },
    declined: {
      subject: "Your Blackline Motors application",
      msg: `We're not able to approve your application right now.${note ? ` ${note}` : ""} If something changes, send us a message or call or text ${site.phoneDisplay}.`,
    },
    applicant: {
      subject: "We need a little more for your application",
      msg: `We need a little more before we can decide: ${note} Please upload it in your portal and submit again.`,
    },
  }[stage as "approved" | "declined" | "applicant"];

  await postAutoMessage(id, text.msg);
  const sent = await sendMail({
    to: c.email,
    fromName: site.name,
    subject: text.subject,
    text: `Hi ${first},\n\n${text.msg}\n\nYour portal: ${portal}\n\nBlackline Motors\n${site.phoneDisplay}`,
  });
  back(
    id,
    "ok",
    `Decision saved (${stage === "applicant" ? "more info requested" : stage}).${sent ? ` Emailed ${c.email}.` : " Email didn't send; they'll see it in the portal."}`,
  );
}

// ---------- vehicle options ----------

function safeName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9.]+/g, "-").replace(/-+/g, "-").slice(-80);
}

export async function createOptionPhotoUpload(fileName: string, customerId?: string) {
  await requireAdmin();
  if (!customerId) return { error: "Missing customer." };
  const path = `customers/${customerId}/options/${Date.now()}-${safeName(fileName)}`;
  const { data, error } = await adminClient().storage.from("portal").createSignedUploadUrl(path);
  if (error || !data) return { error: "Upload is unavailable right now." };
  return { path: data.path, token: data.token };
}

const optionSchema = z.object({
  vehicle_year: z.coerce.number().int().min(1950).max(2100).optional(),
  vehicle_make: z.string().trim().min(1).max(40),
  vehicle_model: z.string().trim().min(1).max(60),
  vehicle_trim: z.string().trim().max(60).optional(),
  mileage: z.coerce.number().int().min(0).max(2_000_000).optional(),
  frequency: z.enum(["monthly", "biweekly", "weekly"]),
  term_payments: z.coerce.number().int().min(1).max(520).optional(),
  care_plan_note: z.string().trim().max(120).optional(),
  description: z.string().trim().max(2000).optional(),
});

export async function addVehicleOption(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "customer_id");
  const raw = Object.fromEntries(
    [...formData.entries()].filter(([, v]) => typeof v === "string" && v.trim() !== ""),
  );
  const parsed = optionSchema.safeParse(raw);
  const payment = toCents(formData.get("payment"));
  const down = toCents(formData.get("down_payment") || "0");
  const cash = formData.get("cash_price") ? toCents(formData.get("cash_price")) : null;
  if (!parsed.success || !(payment > 0) || !(down >= 0) || (cash !== null && !(cash > 0))) {
    back(id, "error", "Add the make, model and payment amount (numbers only for dollars).");
  }
  const photo = str(formData, "storage_path");
  if (photo && !photo.startsWith(`customers/${id}/options/`)) back(id, "error", "Photo upload failed.");
  const d = parsed.data!;
  const { error } = await adminClient()
    .from("vehicle_options")
    .insert({
      customer_id: id,
      status: "draft",
      vehicle_year: d.vehicle_year ?? null,
      vehicle_make: d.vehicle_make,
      vehicle_model: d.vehicle_model,
      vehicle_trim: d.vehicle_trim ?? null,
      mileage: d.mileage ?? null,
      photo_path: photo || null,
      description: d.description ?? null,
      cash_price_cents: cash,
      down_payment_cents: down,
      payment_cents: payment,
      frequency: d.frequency,
      term_payments: d.term_payments ?? null,
      care_plan_note: d.care_plan_note ?? null,
    });
  if (error) back(id, "error", error.message);
  back(id, "ok", "Option saved as a draft. Add more, then click Send options.");
}

export async function sendOptions(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "customer_id");
  const customer = await loadCustomer(id);
  if (!customer || customer.stage !== "approved") back(id, "error", "Approve the application before sending options.");
  const db = adminClient();
  const now = new Date();
  const expires = new Date(now.getTime() + OPTION_HOURS * 3_600_000);
  const { data, error } = await db
    .from("vehicle_options")
    .update({ status: "offered", sent_at: now.toISOString(), expires_at: expires.toISOString() })
    .eq("customer_id", id)
    .eq("status", "draft")
    .select("*");
  if (error) back(id, "error", error.message);
  if (!data?.length) back(id, "error", "There are no draft options to send.");

  const c = customer!;
  const names = data!.map((o) => `• ${optionName(o)}`).join("\n");
  const msg = `Your vehicle options are ready. Pick one in your portal before ${prettyDateTime(expires.toISOString())} (Mountain time). After that they expire.`;
  await postAutoMessage(id, msg);
  const sent = await sendMail({
    to: c.email,
    fromName: site.name,
    subject: "Your vehicle options are ready (24 hours to pick)",
    text: `Hi ${c.full_name.split(" ")[0]},\n\n${msg}\n\n${names}\n\nSee photos and details and make your pick: ${await baseUrl()}/portal\n\nQuestions? Call or text ${site.phoneDisplay}.\n\nBlackline Motors`,
  });
  back(
    id,
    "ok",
    `${data!.length} option${data!.length === 1 ? "" : "s"} sent. They expire ${prettyDateTime(expires.toISOString())}.${sent ? "" : " The email didn't send; they'll see them in the portal."}`,
  );
}

export async function removeOption(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "customer_id");
  const optionId = str(formData, "option_id");
  const db = adminClient();
  const { data } = await db
    .from("vehicle_options")
    .select("status, photo_path")
    .eq("id", optionId)
    .eq("customer_id", id)
    .maybeSingle();
  if (!data) back(id, "error", "Option not found.");
  if (data!.status === "draft") {
    if (data!.photo_path) await db.storage.from("portal").remove([data!.photo_path]);
    await db.from("vehicle_options").delete().eq("id", optionId);
    back(id, "ok", "Draft deleted.");
  }
  if (data!.status === "offered") {
    await db.from("vehicle_options").update({ status: "withdrawn" }).eq("id", optionId);
    back(id, "ok", "Option withdrawn. The customer can no longer pick it.");
  }
  back(id, "error", "That option can't be changed now.");
}
