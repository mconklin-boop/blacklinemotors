import { adminClient } from "./supabase";
import { money } from "./account";
import { sendMail } from "@/lib/mailer";
import { site } from "@/lib/site";
import type { Application, Customer, PortalDocument, VehicleOption } from "./types";

// Documents an applicant uploads before submitting.
export const DOC_KINDS = [
  {
    kind: "license",
    title: "Driver's license",
    help: "A clear photo of the front of your valid driver's license.",
  },
  {
    kind: "income",
    title: "Proof of income",
    help: "Your two most recent pay stubs. Upload each one separately.",
  },
  {
    kind: "residence",
    title: "Proof of residence",
    help: "A recent utility bill, lease or bank statement showing your current address.",
  },
] as const;

export type DocKind = (typeof DOC_KINDS)[number]["kind"];
export const isDocKind = (value: string): value is DocKind => DOC_KINDS.some((d) => d.kind === value);

export const PURGE_AFTER_DAYS = 30;
export const WARN_AFTER_DAYS = 23;
export const OPTION_HOURS = 24;

export function adminAlertEmail() {
  return process.env.LEADS_ALERT_EMAIL || site.email;
}

export function daysLeftToSubmit(customer: Pick<Customer, "created_at">) {
  const ageMs = Date.now() - new Date(customer.created_at).getTime();
  return Math.max(0, PURGE_AFTER_DAYS - Math.floor(ageMs / 86_400_000));
}

export function prettyDateTime(value: string | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-US", {
    timeZone: "America/Denver",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function optionName(o: Pick<VehicleOption, "vehicle_year" | "vehicle_make" | "vehicle_model" | "vehicle_trim">) {
  return [o.vehicle_year, o.vehicle_make, o.vehicle_model, o.vehicle_trim].filter(Boolean).join(" ");
}

export function isLive(o: VehicleOption) {
  return o.status === "offered" && !!o.expires_at && new Date(o.expires_at).getTime() > Date.now();
}

// "offered" past its expiry reads as expired everywhere, even before the daily job marks it.
export function effectiveStatus(o: VehicleOption): VehicleOption["status"] {
  return o.status === "offered" && !isLive(o) ? "expired" : o.status;
}

const freqLabel = { monthly: "month", biweekly: "two weeks", weekly: "week" } as const;

export function optionTerms(o: VehicleOption) {
  const parts = [`${money(o.payment_cents)} per ${freqLabel[o.frequency]}`];
  if (o.term_payments) parts.push(`${o.term_payments} payments`);
  if (o.down_payment_cents > 0) parts.push(`${money(o.down_payment_cents)} down`);
  return parts.join(" · ");
}

export function applicationChecklist(app: Application, docs: PortalDocument[]) {
  const has = (kind: DocKind) => docs.filter((d) => d.kind === kind).length;
  const refs = (app.references ?? []).filter((r) => r.name && r.phone);
  return {
    license: has("license") >= 1,
    income: has("income") >= 1,
    residence: has("residence") >= 1,
    details: Boolean(app.employer) && refs.length >= 2,
  };
}

export async function loadOptions(customerId: string, includeDrafts = false) {
  let query = adminClient()
    .from("vehicle_options")
    .select("*")
    .eq("customer_id", customerId)
    .order("created_at", { ascending: true });
  if (!includeDrafts) query = query.neq("status", "draft");
  const { data } = await query;
  return (data ?? []) as VehicleOption[];
}

export async function postAutoMessage(customerId: string, body: string) {
  await adminClient()
    .from("messages")
    .insert({ customer_id: customerId, sender: "blackline", body: `[Automatic] ${body}` });
}

// Creates the applicant's portal login (or finds an existing one) and emails a
// link to set a password. Never throws; returns false if nothing was set up.
export async function createApplicantAccount(input: {
  name: string;
  email: string;
  phone: string;
  language: "en" | "es";
  application: Application;
  baseUrl: string;
}): Promise<boolean> {
  const db = adminClient();
  const es = input.language === "es";
  const redirectTo = `${input.baseUrl}/portal/set-password`;

  const invite = await db.auth.admin.generateLink({
    type: "invite",
    email: input.email,
    options: { redirectTo, data: { full_name: input.name } },
  });

  if (invite.error || !invite.data.user) {
    // Most likely the email already has a login. Send a sign-in link instead
    // of telling the visitor anything about the account.
    const recovery = await db.auth.admin.generateLink({
      type: "recovery",
      email: input.email,
      options: { redirectTo },
    });
    if (recovery.error || !recovery.data.properties?.action_link) return false;
    return sendMail({
      to: input.email,
      fromName: site.name,
      subject: es ? "Su cuenta de Blackline Motors" : "Your Blackline Motors account",
      text: es
        ? `Hola ${input.name},\n\nRecibimos su solicitud. Ya tiene una cuenta con nosotros. Use este enlace para entrar y crear una nueva contraseña:\n\n${recovery.data.properties.action_link}\n\nDespués puede entrar en ${input.baseUrl}/portal/login.\n\nPreguntas: llame o envíe un mensaje al ${site.phoneDisplay}.\n\nBlackline Motors`
        : `Hi ${input.name},\n\nWe got your application. You already have an account with us. Use this link to sign in and set a new password:\n\n${recovery.data.properties.action_link}\n\nAfter that, sign in any time at ${input.baseUrl}/portal/login.\n\nQuestions? Call or text ${site.phoneDisplay}.\n\nBlackline Motors`,
    });
  }

  const userId = invite.data.user.id;
  const { error } = await db.from("customers").insert({
    id: userId,
    full_name: input.name,
    email: input.email,
    phone: input.phone,
    stage: "applicant",
    language: input.language,
    application: input.application,
  });
  if (error) {
    await db.auth.admin.deleteUser(userId);
    return false;
  }

  const link = invite.data.properties.action_link;
  return sendMail({
    to: input.email,
    fromName: site.name,
    subject: es
      ? "Termine su solicitud con Blackline Motors"
      : "Finish your Blackline Motors application",
    text: es
      ? `Hola ${input.name},\n\nGracias por precalificar. Creamos su portal de cliente seguro.\n\n1. Cree su contraseña con este enlace:\n${link}\n\n2. Suba su licencia de manejo, comprobante de ingresos y comprobante de domicilio.\n3. Le daremos una decisión dentro del portal y, si es aprobado, sus opciones de vehículo.\n\nSi el enlace vence, vaya a ${input.baseUrl}/portal/forgot-password para recibir uno nuevo.\n\nImportante: si no sube sus documentos dentro de ${PURGE_AFTER_DAYS} días, su cuenta se borrará automáticamente.\n\nPreguntas: llame o envíe un mensaje al ${site.phoneDisplay}.\n\nBlackline Motors`
      : `Hi ${input.name},\n\nThanks for pre-qualifying. We've set up your secure customer portal.\n\n1. Create your password with this link:\n${link}\n\n2. Upload your driver's license, proof of income and proof of residence.\n3. We'll post your approval decision in the portal and, if you're approved, your vehicle options.\n\nIf the link expires, go to ${input.baseUrl}/portal/forgot-password to get a new one.\n\nHeads up: if your documents aren't submitted within ${PURGE_AFTER_DAYS} days, the account is deleted automatically.\n\nQuestions? Call or text ${site.phoneDisplay}.\n\nBlackline Motors`,
  });
}
