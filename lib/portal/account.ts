import type { Agreement, Fee, Payment } from "./types";

// ---------- money and dates ----------

export function money(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    cents / 100,
  );
}

export function toCents(value: FormDataEntryValue | null): number {
  const n = Number(String(value ?? "").replace(/[$,\s]/g, ""));
  return Number.isFinite(n) ? Math.round(n * 100) : NaN;
}

// Today's date in Denver as YYYY-MM-DD.
export function denverToday(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Denver",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function parse(iso: string) {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  return { y, m, d };
}

function iso(y: number, m: number, d: number) {
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function addMonths(start: string, months: number) {
  const { y, m, d } = parse(start);
  const total = m - 1 + months;
  const year = y + Math.floor(total / 12);
  const month = (total % 12) + 1;
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return iso(year, month, Math.min(d, lastDay));
}

function addDays(start: string, days: number) {
  const { y, m, d } = parse(start);
  const dt = new Date(Date.UTC(y, m - 1, d + days));
  return iso(dt.getUTCFullYear(), dt.getUTCMonth() + 1, dt.getUTCDate());
}

export function daysBetween(from: string, to: string) {
  const a = parse(from);
  const b = parse(to);
  return Math.round(
    (Date.UTC(b.y, b.m - 1, b.d) - Date.UTC(a.y, a.m - 1, a.d)) / 86_400_000,
  );
}

export function prettyDate(value: string | null | undefined) {
  if (!value) return "—";
  const { y, m, d } = parse(value);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", {
    timeZone: "UTC",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ---------- payment schedule ----------

export type Installment = {
  number: number;
  dueDate: string;
  rentalCents: number;
  carePlanCents: number;
  downPaymentCents: number;
  totalCents: number;
};

export function buildSchedule(a: Agreement): Installment[] {
  const parts = a.down_payment_installments > 0 ? a.down_payment_installments : 0;
  const dpBase = parts ? Math.floor(a.down_payment_cents / parts) : 0;
  const dpRemainder = parts ? a.down_payment_cents - dpBase * parts : 0;

  return Array.from({ length: a.term_payments }, (_, i) => {
    const dueDate =
      a.frequency === "monthly"
        ? addMonths(a.first_due_date, i)
        : addDays(a.first_due_date, i * (a.frequency === "biweekly" ? 14 : 7));
    const downPaymentCents = i < parts ? dpBase + (i === 0 ? dpRemainder : 0) : 0;
    const totalCents = a.rental_payment_cents + a.care_plan_cents + downPaymentCents;
    return {
      number: i + 1,
      dueDate,
      rentalCents: a.rental_payment_cents,
      carePlanCents: a.care_plan_cents,
      downPaymentCents,
      totalCents,
    };
  });
}

// ---------- account summary ----------

export type InstallmentStatus = Installment & {
  paidCents: number;
  state: "paid" | "partial" | "due" | "late" | "upcoming";
};

export type AccountSummary = {
  schedule: InstallmentStatus[];
  paidTotalCents: number;
  pendingTotalCents: number;
  paymentsCompleted: number;
  paymentsRemaining: number;
  remainingToOwnershipCents: number;
  scheduledTotalCents: number;
  feesOpenCents: number;
  amountDueNowCents: number;
  nextInstallment: InstallmentStatus | null;
  daysLate: number;
  pastGrace: boolean;
  earlyPurchaseCents: number | null;
  progressPct: number;
};

// Payments are applied to scheduled payments oldest first, then to fees.
export function summarize(
  a: Agreement,
  payments: Payment[],
  fees: Fee[],
  today = denverToday(),
): AccountSummary {
  const schedule = buildSchedule(a);
  const paidTotalCents = payments
    .filter((p) => p.status === "succeeded")
    .reduce((s, p) => s + p.amount_cents, 0);
  const pendingTotalCents = payments
    .filter((p) => p.status === "pending")
    .reduce((s, p) => s + p.amount_cents, 0);
  const feesTotal = fees.filter((f) => !f.waived).reduce((s, f) => s + f.amount_cents, 0);
  const scheduledTotalCents = schedule.reduce((s, i) => s + i.totalCents, 0);

  let pool = paidTotalCents;
  const statuses: InstallmentStatus[] = schedule.map((inst) => {
    const paidCents = Math.min(pool, inst.totalCents);
    pool -= paidCents;
    let state: InstallmentStatus["state"];
    if (paidCents >= inst.totalCents) state = "paid";
    else if (inst.dueDate < today) state = "late";
    else if (inst.dueDate === today) state = "due";
    else state = paidCents > 0 ? "partial" : "upcoming";
    return { ...inst, paidCents, state };
  });

  const towardFees = Math.min(pool, feesTotal);
  const feesOpenCents = feesTotal - towardFees;

  const paymentsCompleted = statuses.filter((s) => s.state === "paid").length;
  const appliedToSchedule = Math.min(paidTotalCents, scheduledTotalCents);
  const remainingToOwnershipCents = scheduledTotalCents - appliedToSchedule;

  const dueNowSchedule = statuses
    .filter((s) => s.dueDate <= today)
    .reduce((s, i) => s + (i.totalCents - i.paidCents), 0);
  const amountDueNowCents = Math.max(0, dueNowSchedule + feesOpenCents - pendingTotalCents);

  const nextInstallment = statuses.find((s) => s.state !== "paid") ?? null;
  const oldestLate = statuses.find((s) => s.state === "late");
  const daysLate = oldestLate ? daysBetween(oldestLate.dueDate, today) : 0;

  // Early purchase option: the lesser of (cash price minus a credit of
  // early_purchase_credit_pct% of rental payments made) or the rental
  // payments that remain. Care Plan amounts are not part of either figure.
  let earlyPurchaseCents: number | null = null;
  if (a.cash_price_cents && a.status === "active") {
    const rentalPaid = statuses.reduce(
      (s, i) => s + Math.min(i.rentalCents, Math.max(0, i.paidCents - i.carePlanCents - i.downPaymentCents)),
      0,
    );
    const credit = Math.round((rentalPaid * Number(a.early_purchase_credit_pct)) / 100);
    const rentalRemaining = a.rental_payment_cents * a.term_payments - rentalPaid;
    earlyPurchaseCents = Math.max(0, Math.min(a.cash_price_cents - credit, rentalRemaining));
  }

  return {
    schedule: statuses,
    paidTotalCents,
    pendingTotalCents,
    paymentsCompleted,
    paymentsRemaining: a.term_payments - paymentsCompleted,
    remainingToOwnershipCents,
    scheduledTotalCents,
    feesOpenCents,
    amountDueNowCents,
    nextInstallment,
    daysLate,
    pastGrace: daysLate > a.grace_days,
    earlyPurchaseCents,
    progressPct: Math.round((paymentsCompleted / a.term_payments) * 100),
  };
}

export function vehicleName(a: Pick<Agreement, "vehicle_year" | "vehicle_make" | "vehicle_model" | "vehicle_trim">) {
  return [a.vehicle_year, a.vehicle_make, a.vehicle_model, a.vehicle_trim].filter(Boolean).join(" ") || "Vehicle";
}

export const methodLabels: Record<Payment["method"], string> = {
  ach: "Bank (ACH)",
  cash: "Cash",
  check: "Check",
  money_order: "Money order",
  zelle: "Zelle",
  other: "Other",
};

export const feeLabels: Record<Fee["kind"], string> = {
  late: "Late fee",
  returned_payment: "Returned payment fee",
  reinstatement: "Reinstatement fee",
  other: "Other charge",
};
