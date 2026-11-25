"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/portal/session";
import { adminClient, anonClient } from "@/lib/portal/supabase";
import { toCents } from "@/lib/portal/account";

const q = encodeURIComponent;
const back = (customerId: string, key: "ok" | "error", msg: string): never =>
  redirect(`/portal/admin/customers/${customerId}?${key}=${q(msg)}`);

async function baseUrl() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "www.blacklinemotorsco.com";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

function str(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

// ---------- customers ----------

export async function inviteCustomer(formData: FormData) {
  await requireAdmin();
  const full_name = str(formData, "full_name");
  const email = str(formData, "email").toLowerCase();
  const phone = str(formData, "phone");
  if (!full_name || !z.string().email().safeParse(email).success) {
    redirect(`/portal/admin?error=${q("Enter the customer's full name and a valid email.")}`);
  }
  const sendNow = str(formData, "send_invite") === "on";
  const db = adminClient();
  // Either email the invite now, or create the login quietly so the account
  // can be set up first; "Send password link" emails the customer later.
  const { data, error } = sendNow
    ? await db.auth.admin.inviteUserByEmail(email, {
        redirectTo: `${await baseUrl()}/portal/set-password`,
        data: { full_name },
      })
    : await db.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: { full_name },
      });
  if (error || !data.user) {
    redirect(
      `/portal/admin?error=${q(`Invite failed: ${error?.message ?? "unknown error"}. If this email already has a login, open the customer and use "Send password link".`)}`,
    );
  }
  const { error: insertError } = await db
    .from("customers")
    .insert({ id: data.user.id, full_name, email, phone: phone || null });
  if (insertError) {
    redirect(`/portal/admin?error=${q(`Login created but the customer record failed: ${insertError.message}`)}`);
  }
  back(
    data.user.id,
    "ok",
    sendNow
      ? `Invite emailed to ${email}. They'll set their password from the link.`
      : `Account created for ${email}. No email was sent. Use "Send password link" when you're ready.`,
  );
}

export async function sendPasswordLink(formData: FormData) {
  await requireAdmin();
  const customerId = str(formData, "customer_id");
  const email = str(formData, "email");
  const { error } = await anonClient().auth.resetPasswordForEmail(email, {
    redirectTo: `${await baseUrl()}/portal/set-password`,
  });
  if (error) back(customerId, "error", `Couldn't send: ${error.message}`);
  back(customerId, "ok", `Password link emailed to ${email}.`);
}

export async function updateCustomer(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "customer_id");
  const fields = ["full_name", "phone", "address_line1", "address_line2", "city", "state", "zip"];
  const update = Object.fromEntries(fields.map((f) => [f, str(formData, f) || null]));
  if (!update.full_name) back(id, "error", "Name is required.");
  const { error } = await adminClient().from("customers").update(update).eq("id", id);
  if (error) back(id, "error", error.message);
  back(id, "ok", "Customer saved.");
}

// ---------- agreements ----------

const agreementSchema = z.object({
  agreement_number: z.string().trim().min(1),
  status: z.enum(["pending", "active", "completed", "returned", "terminated"]),
  vehicle_year: z.coerce.number().int().min(1950).max(2100).optional(),
  vehicle_make: z.string().trim().optional(),
  vehicle_model: z.string().trim().optional(),
  vehicle_trim: z.string().trim().optional(),
  vin: z.string().trim().toUpperCase().optional(),
  start_date: z.string().optional(),
  first_due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  frequency: z.enum(["monthly", "biweekly", "weekly"]),
  term_payments: z.coerce.number().int().min(1).max(260),
  care_plan_tier: z.enum(["Essential", "Plus"]),
  down_payment_installments: z.coerce.number().int().min(0).max(12),
  early_purchase_credit_pct: z.coerce.number().min(0).max(100),
  grace_days: z.coerce.number().int().min(0).max(30),
  autopay: z.string().optional(),
  notes: z.string().optional(),
});

export async function saveAgreement(formData: FormData) {
  await requireAdmin();
  const customerId = str(formData, "customer_id");
  const agreementId = str(formData, "agreement_id");
  const raw = Object.fromEntries(
    [...formData.entries()].filter(([, v]) => typeof v === "string" && v.trim() !== ""),
  );
  const parsed = agreementSchema.safeParse(raw);
  const cents = {
    rental_payment_cents: toCents(formData.get("rental_payment")),
    care_plan_cents: toCents(formData.get("care_plan")),
    down_payment_cents: toCents(formData.get("down_payment") || "0"),
    cash_price_cents: formData.get("cash_price") ? toCents(formData.get("cash_price")) : null,
    late_fee_cents: toCents(formData.get("late_fee") || "25"),
  };
  const badMoney = Object.entries(cents).some(
    ([k, v]) => !(k === "cash_price_cents" && v === null) && !(Number.isFinite(v) && (v as number) >= 0),
  );
  if (!parsed.success || badMoney) {
    const field = parsed.success ? "a dollar amount" : parsed.error.issues[0]?.path.join(".");
    back(customerId, "error", `Check ${field} and try again.`);
  }
  const d = parsed.data!;
  const row = {
    customer_id: customerId,
    agreement_number: d.agreement_number,
    status: d.status,
    vehicle_year: d.vehicle_year ?? null,
    vehicle_make: d.vehicle_make ?? null,
    vehicle_model: d.vehicle_model ?? null,
    vehicle_trim: d.vehicle_trim ?? null,
    vin: d.vin ?? null,
    start_date: d.start_date ?? null,
    first_due_date: d.first_due_date,
    frequency: d.frequency,
    term_payments: d.term_payments,
    care_plan_tier: d.care_plan_tier,
    down_payment_installments: d.down_payment_installments,
    early_purchase_credit_pct: d.early_purchase_credit_pct,
    grace_days: d.grace_days,
    autopay: d.autopay === "on",
    notes: d.notes ?? null,
    ...cents,
  };
  const db = adminClient();
  const { error } = agreementId
    ? await db.from("agreements").update(row).eq("id", agreementId)
    : await db.from("agreements").insert(row);
  if (error) back(customerId, "error", error.message);
  // An agreement turns an applicant into a regular customer account.
  await db.from("customers").update({ stage: "customer" }).eq("id", customerId).neq("stage", "customer");
  back(customerId, "ok", agreementId ? "Agreement updated." : "Agreement created.");
}

// ---------- payments and fees ----------

export async function recordPayment(formData: FormData) {
  await requireAdmin();
  const customerId = str(formData, "customer_id");
  const amount = toCents(formData.get("amount"));
  if (!Number.isFinite(amount) || amount <= 0) back(customerId, "error", "Enter a payment amount.");
  const { error } = await adminClient().from("payments").insert({
    agreement_id: str(formData, "agreement_id"),
    amount_cents: amount,
    paid_on: str(formData, "paid_on") || undefined,
    method: str(formData, "method") || "cash",
    status: "succeeded",
    reference: str(formData, "reference") || null,
    note: str(formData, "note") || null,
  });
  if (error) back(customerId, "error", error.message);
  back(customerId, "ok", "Payment recorded.");
}

export async function setPaymentStatus(formData: FormData) {
  await requireAdmin();
  const customerId = str(formData, "customer_id");
  const status = str(formData, "status");
  const db = adminClient();
  const { error } =
    status === "delete"
      ? await db.from("payments").delete().eq("id", str(formData, "payment_id"))
      : await db.from("payments").update({ status }).eq("id", str(formData, "payment_id"));
  if (error) back(customerId, "error", error.message);
  back(customerId, "ok", status === "delete" ? "Payment deleted." : `Payment marked ${status}.`);
}

export async function addFee(formData: FormData) {
  await requireAdmin();
  const customerId = str(formData, "customer_id");
  const amount = toCents(formData.get("amount"));
  if (!Number.isFinite(amount) || amount <= 0) back(customerId, "error", "Enter a fee amount.");
  const { error } = await adminClient().from("fees").insert({
    agreement_id: str(formData, "agreement_id"),
    kind: str(formData, "kind"),
    amount_cents: amount,
    assessed_on: str(formData, "assessed_on") || undefined,
    description: str(formData, "description") || null,
  });
  if (error) back(customerId, "error", error.message);
  back(customerId, "ok", "Fee added.");
}

export async function toggleFeeWaived(formData: FormData) {
  await requireAdmin();
  const customerId = str(formData, "customer_id");
  const waived = str(formData, "waived") === "true";
  const { error } = await adminClient()
    .from("fees")
    .update({ waived })
    .eq("id", str(formData, "fee_id"));
  if (error) back(customerId, "error", error.message);
  back(customerId, "ok", waived ? "Fee waived." : "Fee restored.");
}

// ---------- documents ----------

function safeName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9.]+/g, "-").replace(/-+/g, "-").slice(-80);
}

export async function createDocumentUpload(fileName: string, customerId?: string) {
  await requireAdmin();
  if (!customerId) return { error: "Missing customer." };
  const path = `customers/${customerId}/documents/${Date.now()}-${safeName(fileName)}`;
  const { data, error } = await adminClient().storage.from("portal").createSignedUploadUrl(path);
  if (error || !data) return { error: "Upload is unavailable right now." };
  return { path: data.path, token: data.token };
}

export async function addDocument(formData: FormData) {
  await requireAdmin();
  const customerId = str(formData, "customer_id");
  const path = str(formData, "storage_path");
  const title = str(formData, "title");
  if (!title || !path.startsWith(`customers/${customerId}/documents/`)) {
    back(customerId, "error", "Add a title and choose a file.");
  }
  const { error } = await adminClient().from("documents").insert({
    customer_id: customerId,
    agreement_id: str(formData, "agreement_id") || null,
    title,
    storage_path: path,
    visible_to_customer: str(formData, "visible_to_customer") === "on",
  });
  if (error) back(customerId, "error", error.message);
  back(customerId, "ok", "Document added.");
}

export async function updateDocument(formData: FormData) {
  await requireAdmin();
  const customerId = str(formData, "customer_id");
  const id = str(formData, "document_id");
  const op = str(formData, "op");
  const db = adminClient();
  if (op === "delete") {
    const { data } = await db.from("documents").select("storage_path").eq("id", id).maybeSingle();
    if (data?.storage_path) await db.storage.from("portal").remove([data.storage_path]);
    await db.from("documents").delete().eq("id", id);
    back(customerId, "ok", "Document deleted.");
  }
  await db.from("documents").update({ visible_to_customer: op === "show" }).eq("id", id);
  back(customerId, "ok", op === "show" ? "Customer can now see this document." : "Document hidden from customer.");
}

// ---------- insurance ----------

export async function reviewInsurance(formData: FormData) {
  await requireAdmin();
  const customerId = str(formData, "customer_id");
  const status = str(formData, "status");
  if (!["approved", "rejected", "submitted"].includes(status)) back(customerId, "error", "Pick a status.");
  const { error } = await adminClient()
    .from("insurance_policies")
    .update({ status, review_note: str(formData, "review_note") || null })
    .eq("id", str(formData, "policy_id"));
  if (error) back(customerId, "error", error.message);
  back(customerId, "ok", `Insurance marked ${status}.`);
}

// ---------- messages ----------

export async function replyMessage(formData: FormData) {
  await requireAdmin();
  const customerId = str(formData, "customer_id");
  const body = str(formData, "body").slice(0, 4000);
  if (!body) back(customerId, "error", "Type a message first.");
  const { error } = await adminClient()
    .from("messages")
    .insert({ customer_id: customerId, sender: "blackline", body, read_by_admin: true });
  if (error) back(customerId, "error", error.message);
  back(customerId, "ok", "Reply sent. The customer sees it next time they sign in.");
}
