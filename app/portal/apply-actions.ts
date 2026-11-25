"use server";

import { headers } from "next/headers";
import { after } from "next/server";
import { autoReviewEnabled, runAutoReview } from "@/lib/portal/review";
import { startAgreementDraft } from "@/lib/portal/agreement-flow";
import { pandadocEnabled } from "@/lib/portal/pandadoc";
import { redirect } from "next/navigation";
import { z } from "zod";
import { adminClient } from "@/lib/portal/supabase";
import { requireCustomer } from "@/lib/portal/session";
import { loadDocuments } from "@/lib/portal/data";
import { money } from "@/lib/portal/account";
import {
  DOC_KINDS,
  adminAlertEmail,
  applicationChecklist,
  isDocKind,
  isLive,
  optionName,
  optionTerms,
  postAutoMessage,
} from "@/lib/portal/applications";
import { sendMail } from "@/lib/mailer";
import { site } from "@/lib/site";
import type { VehicleOption } from "@/lib/portal/types";

const q = encodeURIComponent;
const home = (key: "ok" | "error", msg: string): never => redirect(`/portal?${key}=${q(msg)}`);

async function baseUrl() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "www.blacklinemotorsco.com";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

function safeName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9.]+/g, "-").replace(/-+/g, "-").slice(-80);
}

async function requireApplicant() {
  const { customer } = await requireCustomer();
  if (!customer) redirect("/portal");
  return customer;
}

// ---------- documents ----------

export async function createApplicationUpload(fileName: string, kind?: string) {
  const customer = await requireApplicant();
  if (customer.stage !== "applicant") return { error: "Your application was already submitted." };
  if (!kind || !isDocKind(kind)) return { error: "Choose a document type." };
  const path = `customers/${customer.id}/application/${kind}-${Date.now()}-${safeName(fileName)}`;
  const { data, error } = await adminClient().storage.from("portal").createSignedUploadUrl(path);
  if (error || !data) return { error: "Upload is unavailable right now." };
  return { path: data.path, token: data.token };
}

export async function addApplicationDocument(formData: FormData) {
  const customer = await requireApplicant();
  if (customer.stage !== "applicant") home("error", "Your application was already submitted.");
  const kind = String(formData.get("kind") ?? "");
  const path = String(formData.get("storage_path") ?? "");
  const def = DOC_KINDS.find((d) => d.kind === kind);
  if (!def || !path.startsWith(`customers/${customer.id}/application/${kind}-`)) {
    home("error", "Upload failed. Please try again.");
  }
  const { error } = await adminClient().from("documents").insert({
    customer_id: customer.id,
    title: def!.title,
    storage_path: path,
    visible_to_customer: true,
    kind,
  });
  if (error) home("error", "We couldn't save that file. Please try again.");
  home("ok", `${def!.title} uploaded.`);
}

export async function removeApplicationDocument(formData: FormData) {
  const customer = await requireApplicant();
  if (customer.stage !== "applicant") home("error", "Your application was already submitted.");
  const id = String(formData.get("document_id") ?? "");
  const db = adminClient();
  const { data } = await db
    .from("documents")
    .select("id, storage_path, kind")
    .eq("id", id)
    .eq("customer_id", customer.id)
    .maybeSingle();
  if (!data || !data.kind) home("error", "That file wasn't found.");
  await db.storage.from("portal").remove([data!.storage_path]);
  await db.from("documents").delete().eq("id", id);
  home("ok", "File removed.");
}

// ---------- employment and references ----------

const detailsSchema = z.object({
  address_line1: z.string().trim().min(4).max(120),
  city: z.string().trim().min(2).max(60),
  state: z.string().trim().min(2).max(2).default("CO"),
  zip: z.string().trim().regex(/^\d{5}(-\d{4})?$/),
  employer: z.string().trim().min(2).max(120),
  employerPhone: z.string().trim().max(30).optional().default(""),
  jobTitle: z.string().trim().max(80).optional().default(""),
  ref1_name: z.string().trim().min(2).max(80),
  ref1_phone: z.string().trim().min(7).max(30),
  ref1_relationship: z.string().trim().max(40).optional().default(""),
  ref2_name: z.string().trim().min(2).max(80),
  ref2_phone: z.string().trim().min(7).max(30),
  ref2_relationship: z.string().trim().max(40).optional().default(""),
});

export async function saveApplicationDetails(formData: FormData) {
  const customer = await requireApplicant();
  if (customer.stage !== "applicant") home("error", "Your application was already submitted.");
  const parsed = detailsSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) home("error", "Add your home address, employer and two references with phone numbers.");
  const d = parsed.data!;
  const application = {
    ...customer.application,
    employer: d.employer,
    employerPhone: d.employerPhone,
    jobTitle: d.jobTitle,
    references: [
      { name: d.ref1_name, phone: d.ref1_phone, relationship: d.ref1_relationship },
      { name: d.ref2_name, phone: d.ref2_phone, relationship: d.ref2_relationship },
    ],
  };
  const { error } = await adminClient()
    .from("customers")
    .update({
      application,
      address_line1: d.address_line1,
      city: d.city,
      state: d.state.toUpperCase(),
      zip: d.zip,
    })
    .eq("id", customer.id);
  if (error) home("error", "We couldn't save that. Please try again.");
  home("ok", "Address, employment and references saved.");
}

// ---------- submit ----------

export async function submitApplication() {
  const customer = await requireApplicant();
  if (customer.stage !== "applicant") home("error", "Your application was already submitted.");
  const docs = (await loadDocuments(customer.id)).filter((d) => d.kind);
  const check = applicationChecklist(customer.application, docs, customer);
  if (!Object.values(check).every(Boolean)) {
    home("error", "Finish every step on the checklist before you submit.");
  }
  const db = adminClient();
  const { error } = await db
    .from("customers")
    .update({ stage: "submitted", submitted_at: new Date().toISOString() })
    .eq("id", customer.id)
    .eq("stage", "applicant");
  if (error) home("error", "We couldn't submit right now. Please try again.");

  await postAutoMessage(
    customer.id,
    "Application received. We'll review your documents and post a decision here, usually within 1 business day.",
  );
  const base = await baseUrl();
  if (autoReviewEnabled()) {
    // Reads the documents after the page responds; approves clean passes.
    after(() => runAutoReview(customer.id, base));
    home("ok", "Application submitted. We're checking your documents now. Your decision will show here, usually within a few minutes.");
  }
  const app = customer.application;
  await sendMail({
    to: adminAlertEmail(),
    replyTo: customer.email,
    fromName: "Blackline Portal",
    subject: `Application ready to review: ${customer.full_name}`,
    text: [
      `${customer.full_name} submitted a rent-to-own application.`,
      "",
      `Phone: ${customer.phone ?? "—"}`,
      `Email: ${customer.email}`,
      `Income: ${app.monthlyIncome ?? "—"}`,
      `Time at job: ${app.timeAtJob ?? "—"} (${app.employer ?? "—"}${app.jobTitle ? `, ${app.jobTitle}` : ""})`,
      `Time at address: ${app.timeAtAddress ?? "—"}`,
      `Wants: ${app.vehicleWanted ?? "—"}${app.preferredModels ? ` (${app.preferredModels})` : ""} · Budget: ${app.budget ?? "—"}`,
      `Documents: ${docs.length} uploaded`,
      "",
      `Review and decide: ${base}/portal/admin/customers/${customer.id}`,
    ].join("\n"),
  });
  home("ok", "Application submitted. We'll post a decision here, usually within 1 business day.");
}

// ---------- choose a vehicle ----------

export async function selectOption(formData: FormData) {
  const customer = await requireApplicant();
  const id = String(formData.get("option_id") ?? "");
  const db = adminClient();
  const { data } = await db
    .from("vehicle_options")
    .select("*")
    .eq("id", id)
    .eq("customer_id", customer.id)
    .maybeSingle();
  const option = data as VehicleOption | null;
  if (customer.stage !== "approved" || !option) home("error", "That option isn't available.");
  if (!isLive(option!)) {
    home("error", "That option has expired. Send us a message and we'll send you new options.");
  }
  const { count } = await db
    .from("vehicle_options")
    .select("id", { count: "exact", head: true })
    .eq("customer_id", customer.id)
    .eq("status", "selected");
  if ((count ?? 0) > 0) home("error", "You've already picked a vehicle.");

  const now = new Date().toISOString();
  const { data: updated } = await db
    .from("vehicle_options")
    .update({ status: "selected", selected_at: now })
    .eq("id", id)
    .eq("status", "offered")
    .gt("expires_at", now)
    .select("id");
  if (!updated?.length) home("error", "That option just expired. Send us a message and we'll send new options.");
  await db
    .from("vehicle_options")
    .update({ status: "not_selected" })
    .eq("customer_id", customer.id)
    .eq("status", "offered");

  const o = option!;
  const name = optionName(o);
  await postAutoMessage(
    customer.id,
    `You picked the ${name} (${optionTerms(o)}). We're securing the vehicle now and will be in touch about next steps.`,
  );
  const base = await baseUrl();
  await Promise.all([
    sendMail({
      to: adminAlertEmail(),
      replyTo: customer.email,
      fromName: "Blackline Portal",
      subject: `Vehicle picked: ${customer.full_name} chose the ${name}`,
      text: [
        `${customer.full_name} picked a vehicle. Time to buy it.`,
        "",
        `Vehicle: ${name}${o.mileage ? ` · ${o.mileage.toLocaleString("en-US")} miles` : ""}`,
        `Terms offered: ${optionTerms(o)}`,
        o.cash_price_cents ? `Cash price: ${money(o.cash_price_cents)}` : null,
        o.source ? `Source: ${o.source}${o.lot ? ` lot ${o.lot}` : ""}${o.listing_url ? ` · ${o.listing_url}` : ""}` : null,
        o.all_in_cents ? `Estimated all-in: ${money(o.all_in_cents)}` : null,
        pandadocEnabled() ? "PandaDoc draft is being created. After you buy, enter the VIN and condition on the customer's page to send it." : null,
        o.care_plan_note ? `Care Plan: ${o.care_plan_note}` : null,
        o.description ? `Notes: ${o.description}` : null,
        "",
        `Customer: ${customer.phone ?? "—"} · ${customer.email}`,
        `Open in admin: ${base}/portal/admin/customers/${customer.id}`,
      ]
        .filter((line) => line !== null)
        .join("\n"),
    }),
    sendMail({
      to: customer.email,
      fromName: site.name,
      subject: `You picked the ${name}`,
      text: `Hi ${customer.full_name.split(" ")[0]},\n\nThanks! You picked the ${name} (${optionTerms(o)}).\n\nWe're securing the vehicle now. We'll reach out about inspection, your agreement and delivery. Final terms are in your written agreement, which you'll review before you sign.\n\nYour portal: ${base}/portal\nQuestions? Call or text ${site.phoneDisplay}.\n\nBlackline Motors`,
    }),
  ]);
  if (pandadocEnabled()) after(() => startAgreementDraft(o.id));
  home("ok", `You picked the ${name}. We'll be in touch about next steps.`);
}
