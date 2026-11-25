// Rent-to-own pricing rules used when options are created automatically.
// Calibrated to Brandon's deal: $6,421 all-in -> $9,000 cash price,
// $561 rental + $39 Essential = $600/month for 24 months.
// Change the numbers here; everything else reads from this file.

export const VEHICLE_CLASSES = {
  car: {
    label: "Cars and small SUVs (4-cylinder)",
    essentialCents: 3900,
    plusCents: 6900,
    downCents: 0,
  },
  v8: {
    label: "V6/V8, half-ton trucks and large SUVs",
    essentialCents: 4900,
    plusCents: 8900,
    downCents: 100000,
  },
  diesel: {
    label: "Light-duty diesel pickups",
    essentialCents: 7900,
    plusCents: 12900,
    downCents: 200000,
  },
} as const;
export type VehicleClass = keyof typeof VEHICLE_CLASSES;
export const isVehicleClass = (v: unknown): v is VehicleClass =>
  typeof v === "string" && v in VEHICLE_CLASSES;

export const PRICING = {
  termPayments: 24,
  cashMarkup: 1.4, // cash price = all-in x 1.4, rounded up to $100
  rentalOverCash: 1.5, // total rental = cash price x 1.5
  // All-in estimate from an auction Buy It Now / current bid:
  auctionFeesMinCents: 150000, // fees, taxes, title, wire: at least $1,500…
  auctionFeesPct: 0.3, // …or 30% of the price, whichever is more
  reconCents: 40000, // average reconditioning
  maxAllInCents: 900000, // never auto-offer anything over $9,000 all-in
  maxPaymentShareOfIncome: 0.2, // payment can't exceed 20% of gross monthly income
};

export function estimateAllInCents(priceCents: number) {
  return priceCents + Math.max(PRICING.auctionFeesMinCents, Math.round(priceCents * PRICING.auctionFeesPct)) + PRICING.reconCents;
}

export function priceOption(allInCents: number, cls: VehicleClass) {
  const c = VEHICLE_CLASSES[cls];
  const cashCents = Math.ceil((allInCents * PRICING.cashMarkup) / 10000) * 10000;
  const rentalCents = Math.round((cashCents * PRICING.rentalOverCash) / PRICING.termPayments / 100) * 100;
  return {
    cashCents,
    rentalCents,
    careEssentialCents: c.essentialCents,
    carePlusCents: c.plusCents,
    paymentCents: rentalCents + c.essentialCents, // what the customer sees (Essential plan)
    downCents: c.downCents,
    termPayments: PRICING.termPayments,
  };
}

// Highest monthly payment we'll offer this applicant.
const budgetTop: Record<string, number> = {
  "Under $400": 40000,
  "$400 – $499": 49900,
  "$500 – $599": 59900,
  "$600 – $699": 69900,
  "$700 or more": 80000,
};
const incomeFloor: Record<string, number> = {
  "Under $2,500": 200000,
  "$2,500 – $2,999": 250000,
  "$3,000 – $3,999": 300000,
  "$4,000 – $4,999": 400000,
  "$5,000 or more": 500000,
};

export function maxPaymentCents(app: { budget?: string; monthlyIncome?: string }, verifiedMonthlyIncomeCents?: number | null) {
  const income = verifiedMonthlyIncomeCents ?? incomeFloor[app.monthlyIncome ?? ""] ?? 300000;
  const byIncome = Math.floor(income * PRICING.maxPaymentShareOfIncome);
  const byBudget = budgetTop[app.budget ?? ""] ?? byIncome;
  return Math.min(byIncome, byBudget);
}

export const BUDGET_OPTIONS = Object.keys(budgetTop);
