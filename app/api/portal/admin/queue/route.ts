import { NextResponse } from "next/server";
import { adminClient } from "@/lib/portal/supabase";
import { isAdminRequest } from "@/lib/portal/api-auth";
import { effectiveStatus } from "@/lib/portal/applications";
import { limitsFor } from "@/lib/portal/offers";
import { PRICING, VEHICLE_CLASSES } from "@/lib/portal/pricing";
import type { Customer, VehicleOption } from "@/lib/portal/types";

export const dynamic = "force-dynamic";

// Approved applicants who need vehicle options: none live, none picked, no drafts waiting.
export async function GET() {
  if (!(await isAdminRequest())) return NextResponse.json({ error: "Sign in as admin first." }, { status: 401 });
  const db = adminClient();
  const [{ data: c }, { data: o }] = await Promise.all([
    db.from("customers").select("*").eq("stage", "approved"),
    db.from("vehicle_options").select("*"),
  ]);
  const options = (o ?? []) as VehicleOption[];
  const queue = ((c ?? []) as Customer[])
    .filter((cust) => {
      const mine = options.filter((x) => x.customer_id === cust.id);
      return !mine.some((x) => x.status === "selected" || x.status === "draft" || effectiveStatus(x) === "offered");
    })
    .map((cust) => ({
      customer_id: cust.id,
      first_name: cust.full_name.split(" ")[0],
      city: cust.city,
      zip: cust.zip,
      vehicle_type: cust.application.vehicleWanted ?? null,
      preferred_models: cust.application.preferredModels ?? null,
      must_haves: cust.application.mustHaves ?? null,
      budget: cust.application.budget ?? null,
      previously_offered: options
        .filter((x) => x.customer_id === cust.id)
        .map((x) => [x.vehicle_year, x.vehicle_make, x.vehicle_model, x.lot && `lot ${x.lot}`].filter(Boolean).join(" ")),
      limits: limitsFor(cust),
    }));
  return NextResponse.json({
    queue,
    rules: {
      classes: Object.fromEntries(Object.entries(VEHICLE_CLASSES).map(([k, v]) => [k, v.label])),
      allInEstimate: `price + max($${PRICING.auctionFeesMinCents / 100}, ${PRICING.auctionFeesPct * 100}% of price) + $${PRICING.reconCents / 100} recon`,
      requirements: "clean title, run and drive, Colorado location preferred, Buy It Now price known",
    },
  });
}
