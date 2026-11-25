import { adminClient } from "./supabase";
import { OPTION_HOURS, optionName, postAutoMessage, prettyDateTime } from "./applications";
import { PRICING, VEHICLE_CLASSES, maxPaymentCents, type VehicleClass } from "./pricing";
import { sendMail } from "@/lib/mailer";
import { site } from "@/lib/site";
import type { Customer, VehicleOption } from "./types";

// Turns every draft option for a customer into a live 24-hour offer and emails them.
export async function offerDrafts(customer: Customer, baseUrl: string) {
  const now = new Date();
  const expires = new Date(now.getTime() + OPTION_HOURS * 3_600_000);
  const { data, error } = await adminClient()
    .from("vehicle_options")
    .update({ status: "offered", sent_at: now.toISOString(), expires_at: expires.toISOString() })
    .eq("customer_id", customer.id)
    .eq("status", "draft")
    .select("*");
  if (error) return { count: 0, error: error.message, expires, emailed: false };
  const sentOptions = (data ?? []) as VehicleOption[];
  if (!sentOptions.length) return { count: 0, error: null, expires, emailed: false };

  const names = sentOptions.map((o) => `• ${optionName(o)}`).join("\n");
  const msg = `Your vehicle options are ready. Pick one in your portal before ${prettyDateTime(expires.toISOString())} (Mountain time). After that they expire.`;
  await postAutoMessage(customer.id, msg);
  const emailed = await sendMail({
    to: customer.email,
    fromName: site.name,
    subject: "Your vehicle options are ready (24 hours to pick)",
    text: `Hi ${customer.full_name.split(" ")[0]},\n\n${msg}\n\n${names}\n\nSee photos and details and make your pick: ${baseUrl}/portal\n\nQuestions? Call or text ${site.phoneDisplay}.\n\nBlackline Motors`,
  });
  return { count: sentOptions.length, error: null, expires, emailed };
}

export function verifiedIncomeCents(c: Customer) {
  const v = c.review?.extracted?.verifiedMonthlyIncomeCents;
  return typeof v === "number" && v > 0 ? v : null;
}

// Highest all-in cost and auction price that still fits this customer's payment cap.
export function limitsFor(c: Customer) {
  const maxPay = maxPaymentCents(c.application, verifiedIncomeCents(c));
  const perClass = Object.fromEntries(
    (Object.keys(VEHICLE_CLASSES) as VehicleClass[]).map((cls) => {
      const care = VEHICLE_CLASSES[cls].essentialCents;
      const maxAllIn = Math.min(
        PRICING.maxAllInCents,
        Math.floor(((maxPay - care) * PRICING.termPayments) / PRICING.rentalOverCash / PRICING.cashMarkup),
      );
      // Invert estimateAllInCents (fees are the larger of $1,500 or 30%).
      const fixed = PRICING.auctionFeesMinCents + PRICING.reconCents;
      const p1 = maxAllIn - fixed;
      const maxPrice = p1 * PRICING.auctionFeesPct >= PRICING.auctionFeesMinCents
        ? Math.floor((maxAllIn - PRICING.reconCents) / (1 + PRICING.auctionFeesPct))
        : p1;
      return [cls, { maxAllInCents: Math.max(0, maxAllIn), maxAuctionPriceCents: Math.max(0, maxPrice) }];
    }),
  );
  return { maxPaymentCents: maxPay, perClass };
}
