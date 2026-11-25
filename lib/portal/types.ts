export type Customer = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  stripe_customer_id: string | null;
  created_at: string;
};

export type Agreement = {
  id: string;
  customer_id: string;
  agreement_number: string;
  status: "pending" | "active" | "completed" | "returned" | "terminated";
  vehicle_year: number | null;
  vehicle_make: string | null;
  vehicle_model: string | null;
  vehicle_trim: string | null;
  vin: string | null;
  start_date: string | null;
  first_due_date: string;
  frequency: "monthly" | "biweekly" | "weekly";
  term_payments: number;
  rental_payment_cents: number;
  care_plan_tier: "Essential" | "Plus";
  care_plan_cents: number;
  down_payment_cents: number;
  down_payment_installments: number;
  cash_price_cents: number | null;
  early_purchase_credit_pct: number;
  grace_days: number;
  late_fee_cents: number;
  autopay: boolean;
  notes: string | null;
  created_at: string;
};

export type Payment = {
  id: string;
  agreement_id: string;
  amount_cents: number;
  paid_on: string;
  method: "ach" | "cash" | "check" | "money_order" | "zelle" | "other";
  status: "pending" | "succeeded" | "failed" | "refunded";
  reference: string | null;
  stripe_session_id: string | null;
  stripe_payment_intent: string | null;
  note: string | null;
  created_at: string;
};

export type Fee = {
  id: string;
  agreement_id: string;
  kind: "late" | "returned_payment" | "reinstatement" | "other";
  amount_cents: number;
  assessed_on: string;
  description: string | null;
  waived: boolean;
  created_at: string;
};

export type PortalDocument = {
  id: string;
  customer_id: string;
  agreement_id: string | null;
  title: string;
  storage_path: string;
  visible_to_customer: boolean;
  created_at: string;
};

export type InsurancePolicy = {
  id: string;
  customer_id: string;
  carrier: string;
  policy_number: string | null;
  effective_on: string | null;
  expires_on: string | null;
  storage_path: string | null;
  status: "submitted" | "approved" | "rejected";
  review_note: string | null;
  created_at: string;
};

export type Message = {
  id: string;
  customer_id: string;
  sender: "customer" | "blackline";
  body: string;
  read_by_admin: boolean;
  read_by_customer: boolean;
  created_at: string;
};
