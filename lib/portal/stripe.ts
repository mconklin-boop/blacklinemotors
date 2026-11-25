import crypto from "node:crypto";
import { portalConfig } from "./config";

// Minimal Stripe REST client (no SDK needed). Bank (ACH) payments only:
// cards are never offered for rent-to-own payments.

async function stripeRequest<T>(path: string, params: Record<string, string>): Promise<T> {
  const res = await fetch(`https://api.stripe.com/v1/${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${portalConfig.stripeSecretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(params).toString(),
    cache: "no-store",
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json?.error?.message ?? `Stripe error ${res.status}`);
  }
  return json as T;
}

export async function createStripeCustomer(input: {
  email: string;
  name: string;
  customerId: string;
}) {
  const customer = await stripeRequest<{ id: string }>("customers", {
    email: input.email,
    name: input.name,
    "metadata[portal_customer_id]": input.customerId,
  });
  return customer.id;
}

export async function createAchCheckout(input: {
  stripeCustomerId: string;
  amountCents: number;
  agreementId: string;
  agreementNumber: string;
  customerId: string;
  baseUrl: string;
}) {
  const session = await stripeRequest<{ id: string; url: string }>("checkout/sessions", {
    mode: "payment",
    customer: input.stripeCustomerId,
    "payment_method_types[0]": "us_bank_account",
    "payment_method_options[us_bank_account][verification_method]": "automatic",
    "line_items[0][quantity]": "1",
    "line_items[0][price_data][currency]": "usd",
    "line_items[0][price_data][unit_amount]": String(input.amountCents),
    "line_items[0][price_data][product_data][name]": `Rent-to-own payment – Agreement ${input.agreementNumber}`,
    "metadata[agreement_id]": input.agreementId,
    "metadata[customer_id]": input.customerId,
    "payment_intent_data[metadata][agreement_id]": input.agreementId,
    "payment_intent_data[description]": `Blackline Motors agreement ${input.agreementNumber}`,
    success_url: `${input.baseUrl}/portal/payments?paid=1`,
    cancel_url: `${input.baseUrl}/portal/payments`,
  });
  return session;
}

// Verifies the Stripe-Signature header (v1 HMAC-SHA256, 5-minute tolerance).
export function verifyStripeSignature(payload: string, header: string | null) {
  if (!header || !portalConfig.stripeWebhookSecret) return false;
  const parts = Object.fromEntries(
    header.split(",").map((kv) => {
      const [k, ...v] = kv.split("=");
      return [k, v.join("=")];
    }),
  ) as Record<string, string>;
  const timestamp = parts.t;
  const signatures = header
    .split(",")
    .filter((kv) => kv.startsWith("v1="))
    .map((kv) => kv.slice(3));
  if (!timestamp || !signatures.length) return false;
  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) return false;
  const expected = crypto
    .createHmac("sha256", portalConfig.stripeWebhookSecret)
    .update(`${timestamp}.${payload}`)
    .digest("hex");
  return signatures.some((sig) => {
    const a = Buffer.from(sig, "hex");
    const b = Buffer.from(expected, "hex");
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  });
}
