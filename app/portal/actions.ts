"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { isAdminEmail, portalEnabled, stripeEnabled } from "@/lib/portal/config";
import { adminClient, anonClient } from "@/lib/portal/supabase";
import {
  clearSessionCookies,
  requireCustomer,
  setSessionCookies,
} from "@/lib/portal/session";
import { loadAgreements, primaryAgreement } from "@/lib/portal/data";
import { toCents } from "@/lib/portal/account";
import { createAchCheckout, createStripeCustomer } from "@/lib/portal/stripe";

function q(message: string) {
  return encodeURIComponent(message);
}

async function baseUrl() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "www.blacklinemotorsco.com";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

// ---------- sign in / out ----------

export async function signIn(formData: FormData) {
  if (!portalEnabled()) redirect(`/portal/login?error=${q("The portal is not switched on yet.")}`);
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) redirect(`/portal/login?error=${q("Enter your email and password.")}`);

  const { data, error } = await anonClient().auth.signInWithPassword({ email, password });
  if (error || !data.session) {
    redirect(`/portal/login?error=${q("That email and password didn't match. Try again or reset your password.")}`);
  }
  await setSessionCookies(
    data.session.access_token,
    data.session.refresh_token,
    data.session.expires_in,
  );
  redirect(isAdminEmail(data.session.user.email) ? "/portal/admin" : "/portal");
}

export async function signOut() {
  await clearSessionCookies();
  redirect("/portal/login?ok=" + q("You're signed out."));
}

export async function requestPasswordReset(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (email && portalEnabled()) {
    await anonClient().auth.resetPasswordForEmail(email, {
      redirectTo: `${await baseUrl()}/portal/set-password`,
    });
  }
  // Same answer either way so the form can't be used to test emails.
  redirect(
    `/portal/forgot-password?ok=${q("If that email has a portal account, a reset link is on its way. Check your inbox and spam folder.")}`,
  );
}

// Called by the set-password page after the customer picks a password.
export async function finishPasswordSetup(accessToken: string, refreshToken: string) {
  const { data, error } = await adminClient().auth.getUser(accessToken);
  if (error || !data.user) return { ok: false };
  await setSessionCookies(accessToken, refreshToken, 3600);
  return { ok: true, admin: isAdminEmail(data.user.email) };
}

// ---------- profile ----------

const profileSchema = z.object({
  phone: z.string().trim().min(7).max(30),
  address_line1: z.string().trim().min(3).max(120),
  address_line2: z.string().trim().max(120).optional().default(""),
  city: z.string().trim().min(2).max(60),
  state: z.string().trim().length(2),
  zip: z.string().trim().regex(/^\d{5}(-\d{4})?$/),
});

export async function updateProfile(formData: FormData) {
  const { customer } = await requireCustomer();
  if (!customer) redirect("/portal");
  const parsed = profileSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    redirect(`/portal/profile?error=${q("Check your phone, address and ZIP code and try again.")}`);
  }
  const { error } = await adminClient()
    .from("customers")
    .update({ ...parsed.data, state: parsed.data.state.toUpperCase() })
    .eq("id", customer.id);
  if (error) redirect(`/portal/profile?error=${q("We couldn't save that. Please try again.")}`);

  await adminClient().from("messages").insert({
    customer_id: customer.id,
    sender: "customer",
    body: `[Automatic] Contact info updated: ${parsed.data.phone}, ${parsed.data.address_line1}${parsed.data.address_line2 ? " " + parsed.data.address_line2 : ""}, ${parsed.data.city}, ${parsed.data.state.toUpperCase()} ${parsed.data.zip}`,
  });
  redirect(`/portal/profile?ok=${q("Your contact info is saved.")}`);
}

// ---------- messages ----------

export async function sendMessage(formData: FormData) {
  const { customer } = await requireCustomer();
  if (!customer) redirect("/portal");
  const body = String(formData.get("body") ?? "").trim().slice(0, 4000);
  if (!body) redirect(`/portal/messages?error=${q("Type a message first.")}`);
  const { error } = await adminClient()
    .from("messages")
    .insert({ customer_id: customer.id, sender: "customer", body });
  if (error) redirect(`/portal/messages?error=${q("Your message didn't send. Please try again or call us.")}`);
  redirect(`/portal/messages?ok=${q("Message sent. We'll reply here.")}`);
}

// ---------- uploads (insurance) ----------

function safeName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9.]+/g, "-").replace(/-+/g, "-").slice(-80);
}

export async function createInsuranceUpload(fileName: string) {
  const { customer } = await requireCustomer();
  if (!customer) return { error: "Account not set up." };
  const path = `customers/${customer.id}/insurance/${Date.now()}-${safeName(fileName)}`;
  const { data, error } = await adminClient().storage.from("portal").createSignedUploadUrl(path);
  if (error || !data) return { error: "Upload is unavailable right now." };
  return { path: data.path, token: data.token };
}

const insuranceSchema = z.object({
  carrier: z.string().trim().min(2).max(80),
  policy_number: z.string().trim().max(60).optional().default(""),
  effective_on: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal("")),
  expires_on: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  storage_path: z.string().min(1),
});

export async function submitInsurance(formData: FormData) {
  const { customer } = await requireCustomer();
  if (!customer) redirect("/portal");
  const parsed = insuranceSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    redirect(`/portal/insurance?error=${q("Add your insurance company, expiration date and a photo or PDF of your card.")}`);
  }
  if (!parsed.data.storage_path.startsWith(`customers/${customer.id}/insurance/`)) {
    redirect(`/portal/insurance?error=${q("Upload failed. Please try again.")}`);
  }
  const { error } = await adminClient().from("insurance_policies").insert({
    customer_id: customer.id,
    carrier: parsed.data.carrier,
    policy_number: parsed.data.policy_number || null,
    effective_on: parsed.data.effective_on || null,
    expires_on: parsed.data.expires_on,
    storage_path: parsed.data.storage_path,
  });
  if (error) redirect(`/portal/insurance?error=${q("We couldn't save that. Please try again.")}`);
  redirect(`/portal/insurance?ok=${q("Thanks. We'll review your insurance and mark it approved.")}`);
}

// ---------- payments (Stripe ACH) ----------

export async function startPayment(formData: FormData) {
  const { customer } = await requireCustomer();
  if (!customer) redirect("/portal");
  if (!stripeEnabled()) {
    redirect(`/portal/payments?error=${q("Online bank payments aren't switched on yet. Please call or text us to pay.")}`);
  }
  const account = primaryAgreement(await loadAgreements(customer.id));
  if (!account || account.agreement.status !== "active") {
    redirect(`/portal/payments?error=${q("There's no active agreement to pay on.")}`);
  }
  const amountCents = toCents(formData.get("amount"));
  const max = account.summary.remainingToOwnershipCents + account.summary.feesOpenCents;
  if (!Number.isFinite(amountCents) || amountCents < 100 || amountCents > max) {
    redirect(`/portal/payments?error=${q("Enter an amount between $1.00 and your remaining total.")}`);
  }

  let checkoutUrl: string;
  try {
    let stripeCustomerId = customer.stripe_customer_id;
    if (!stripeCustomerId) {
      stripeCustomerId = await createStripeCustomer({
        email: customer.email,
        name: customer.full_name,
        customerId: customer.id,
      });
      await adminClient()
        .from("customers")
        .update({ stripe_customer_id: stripeCustomerId })
        .eq("id", customer.id);
    }
    const session = await createAchCheckout({
      stripeCustomerId,
      amountCents,
      agreementId: account.agreement.id,
      agreementNumber: account.agreement.agreement_number,
      customerId: customer.id,
      baseUrl: await baseUrl(),
    });
    checkoutUrl = session.url;
  } catch {
    redirect(`/portal/payments?error=${q("We couldn't start the bank payment. Please try again or call us.")}`);
  }
  redirect(checkoutUrl);
}
