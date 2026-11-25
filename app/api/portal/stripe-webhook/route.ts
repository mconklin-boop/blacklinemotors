import { NextResponse } from "next/server";
import { verifyStripeSignature } from "@/lib/portal/stripe";
import { adminClient } from "@/lib/portal/supabase";
import { portalEnabled } from "@/lib/portal/config";

export const runtime = "nodejs";

type CheckoutSession = {
  id: string;
  amount_total: number | null;
  payment_status: "paid" | "unpaid" | "no_payment_required";
  payment_intent: string | null;
  metadata: Record<string, string> | null;
  created: number;
};

function denverDate(unixSeconds: number) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Denver",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(unixSeconds * 1000));
}

// Stripe sends:
//  checkout.session.completed            → bank payment started (usually still processing)
//  checkout.session.async_payment_succeeded → money cleared
//  checkout.session.async_payment_failed    → bank returned / declined it
export async function POST(request: Request) {
  const payload = await request.text();
  if (!verifyStripeSignature(payload, request.headers.get("stripe-signature"))) {
    return new NextResponse("Bad signature", { status: 400 });
  }
  if (!portalEnabled()) return new NextResponse("Portal not configured", { status: 503 });

  const event = JSON.parse(payload) as { type: string; data: { object: CheckoutSession } };
  const session = event.data.object;
  const agreementId = session.metadata?.agreement_id;
  if (!event.type.startsWith("checkout.session.") || !agreementId) {
    return NextResponse.json({ received: true });
  }

  const db = adminClient();
  const status =
    event.type === "checkout.session.async_payment_failed"
      ? "failed"
      : session.payment_status === "paid"
        ? "succeeded"
        : "pending";

  if (event.type === "checkout.session.completed") {
    const { error } = await db.from("payments").upsert(
      {
        agreement_id: agreementId,
        amount_cents: session.amount_total ?? 0,
        paid_on: denverDate(session.created),
        method: "ach",
        status,
        stripe_session_id: session.id,
        stripe_payment_intent: session.payment_intent,
        note: "Paid online through the customer portal",
      },
      { onConflict: "stripe_session_id", ignoreDuplicates: true },
    );
    if (error) return new NextResponse(error.message, { status: 500 });
  } else if (
    event.type === "checkout.session.async_payment_succeeded" ||
    event.type === "checkout.session.async_payment_failed"
  ) {
    const { data, error } = await db
      .from("payments")
      .update({ status })
      .eq("stripe_session_id", session.id)
      .select("id");
    if (error) return new NextResponse(error.message, { status: 500 });
    // If the completed event hasn't been stored yet, ask Stripe to retry.
    if (!data?.length) return new NextResponse("Payment not found yet", { status: 409 });
  }

  return NextResponse.json({ received: true });
}
