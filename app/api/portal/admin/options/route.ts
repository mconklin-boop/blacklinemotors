import { NextResponse } from "next/server";
import { z } from "zod";
import { adminClient } from "@/lib/portal/supabase";
import { isAdminRequest } from "@/lib/portal/api-auth";
import { limitsFor, offerDrafts } from "@/lib/portal/offers";
import { PRICING, estimateAllInCents, isVehicleClass, priceOption } from "@/lib/portal/pricing";
import { site } from "@/lib/site";
import type { Customer } from "@/lib/portal/types";

export const dynamic = "force-dynamic";

const optionSchema = z.object({
  vehicle_year: z.number().int().min(1990).max(2100),
  vehicle_make: z.string().trim().min(1).max(40),
  vehicle_model: z.string().trim().min(1).max(60),
  vehicle_trim: z.string().trim().max(60).optional(),
  mileage: z.number().int().min(0).max(400000).optional(),
  price_cents: z.number().int().min(50000).max(5000000),
  vehicle_class: z.string(),
  source: z.string().trim().max(40),
  lot: z.string().trim().max(40).optional(),
  listing_url: z.string().url().max(500).optional(),
  photo_url: z.string().url().max(800).optional(),
  description: z.string().trim().max(1500).optional(),
});
const bodySchema = z.object({
  customer_id: z.string().uuid(),
  send: z.boolean().default(true),
  options: z.array(optionSchema).min(1).max(5),
});

// Prices each found vehicle with the standard rules, refuses anything that
// doesn't fit the customer's limits, saves the rest, and (send=true) offers them.
export async function POST(request: Request) {
  if (!(await isAdminRequest())) return NextResponse.json({ error: "Sign in as admin first." }, { status: 401 });
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const { customer_id, send, options } = parsed.data;

  const db = adminClient();
  const { data } = await db.from("customers").select("*").eq("id", customer_id).maybeSingle();
  const customer = data as Customer | null;
  if (!customer || customer.stage !== "approved") {
    return NextResponse.json({ error: "Customer isn't approved." }, { status: 409 });
  }
  const limits = limitsFor(customer);
  const accepted: unknown[] = [];
  const rejected: { vehicle: string; reason: string }[] = [];

  for (const o of options) {
    const name = `${o.vehicle_year} ${o.vehicle_make} ${o.vehicle_model}`;
    if (!isVehicleClass(o.vehicle_class)) {
      rejected.push({ vehicle: name, reason: "vehicle_class must be car, v8 or diesel" });
      continue;
    }
    const allIn = estimateAllInCents(o.price_cents);
    const p = priceOption(allIn, o.vehicle_class);
    if (allIn > PRICING.maxAllInCents) {
      rejected.push({ vehicle: name, reason: `all-in $${allIn / 100} is over the $${PRICING.maxAllInCents / 100} cap` });
      continue;
    }
    if (p.paymentCents > limits.maxPaymentCents) {
      rejected.push({ vehicle: name, reason: `payment $${p.paymentCents / 100} is over this customer's $${limits.maxPaymentCents / 100} limit` });
      continue;
    }
    const careNote = `Iron Ridge Care Plan Essential included ($${p.careEssentialCents / 100}/mo); Plus available for $${(p.carePlusCents - p.careEssentialCents) / 100}/mo more`;
    const { data: row, error } = await db
      .from("vehicle_options")
      .insert({
        customer_id,
        status: "draft",
        vehicle_year: o.vehicle_year,
        vehicle_make: o.vehicle_make,
        vehicle_model: o.vehicle_model,
        vehicle_trim: o.vehicle_trim ?? null,
        mileage: o.mileage ?? null,
        photo_url: o.photo_url ?? null,
        description: o.description ?? null,
        vehicle_class: o.vehicle_class,
        source: o.source,
        lot: o.lot ?? null,
        listing_url: o.listing_url ?? null,
        all_in_cents: allIn,
        rental_cents: p.rentalCents,
        care_essential_cents: p.careEssentialCents,
        care_plus_cents: p.carePlusCents,
        cash_price_cents: p.cashCents,
        down_payment_cents: p.downCents,
        payment_cents: p.paymentCents,
        frequency: "monthly",
        term_payments: p.termPayments,
        care_plan_note: careNote,
      })
      .select("id, payment_cents, cash_price_cents, all_in_cents")
      .single();
    if (error) rejected.push({ vehicle: name, reason: error.message });
    else accepted.push({ vehicle: name, ...row });
  }

  let offer = null;
  if (send && accepted.length) offer = await offerDrafts(customer, site.url.replace(/\/$/, ""));
  return NextResponse.json({ accepted, rejected, sent: offer?.count ?? 0, expires: offer?.expires ?? null });
}
