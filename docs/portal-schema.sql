-- Blackline Motors customer portal schema
-- Run once in the Supabase SQL editor for the "blackline-portal" project.
-- Every table has row level security ON with no policies, so only the
-- website's server (service role key) can read or write. Customers never
-- query the database directly; the site checks who they are first.

create extension if not exists pgcrypto;

-- One row per rent-to-own customer. id matches their Supabase login.
create table if not exists public.customers (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  email text not null unique,
  phone text,
  address_line1 text,
  address_line2 text,
  city text,
  state text default 'CO',
  zip text,
  stripe_customer_id text,
  created_at timestamptz not null default now()
);

-- One row per signed rental-purchase agreement.
create table if not exists public.agreements (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers (id) on delete cascade,
  agreement_number text not null unique,
  status text not null default 'pending'
    check (status in ('pending', 'active', 'completed', 'returned', 'terminated')),
  vehicle_year int,
  vehicle_make text,
  vehicle_model text,
  vehicle_trim text,
  vin text,
  start_date date,
  first_due_date date not null,
  frequency text not null default 'monthly'
    check (frequency in ('monthly', 'biweekly', 'weekly')),
  term_payments int not null check (term_payments > 0),
  rental_payment_cents int not null check (rental_payment_cents >= 0),
  care_plan_tier text not null default 'Essential'
    check (care_plan_tier in ('Essential', 'Plus')),
  care_plan_cents int not null default 0 check (care_plan_cents >= 0),
  down_payment_cents int not null default 0 check (down_payment_cents >= 0),
  down_payment_installments int not null default 0 check (down_payment_installments >= 0),
  cash_price_cents int,
  early_purchase_credit_pct numeric not null default 50,
  grace_days int not null default 7,
  late_fee_cents int not null default 2500,
  autopay boolean not null default false,
  notes text,
  created_at timestamptz not null default now()
);
create index if not exists agreements_customer_idx on public.agreements (customer_id);

-- Money received. Stripe ACH payments are added by the webhook;
-- cash, check or other payments are added from the admin page.
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  agreement_id uuid not null references public.agreements (id) on delete cascade,
  amount_cents int not null check (amount_cents > 0),
  paid_on date not null default current_date,
  method text not null default 'ach'
    check (method in ('ach', 'cash', 'check', 'money_order', 'zelle', 'other')),
  status text not null default 'succeeded'
    check (status in ('pending', 'succeeded', 'failed', 'refunded')),
  reference text,
  stripe_session_id text unique,
  stripe_payment_intent text,
  note text,
  created_at timestamptz not null default now()
);
create index if not exists payments_agreement_idx on public.payments (agreement_id);

-- Late, returned-payment and reinstatement fees (or other charges).
create table if not exists public.fees (
  id uuid primary key default gen_random_uuid(),
  agreement_id uuid not null references public.agreements (id) on delete cascade,
  kind text not null check (kind in ('late', 'returned_payment', 'reinstatement', 'other')),
  amount_cents int not null check (amount_cents > 0),
  assessed_on date not null default current_date,
  description text,
  waived boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists fees_agreement_idx on public.fees (agreement_id);

-- Signed contracts and other files shared with the customer.
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers (id) on delete cascade,
  agreement_id uuid references public.agreements (id) on delete set null,
  title text not null,
  storage_path text not null,
  visible_to_customer boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists documents_customer_idx on public.documents (customer_id);

-- Proof of insurance the customer uploads, reviewed by Blackline.
create table if not exists public.insurance_policies (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers (id) on delete cascade,
  carrier text not null,
  policy_number text,
  effective_on date,
  expires_on date,
  storage_path text,
  status text not null default 'submitted'
    check (status in ('submitted', 'approved', 'rejected')),
  review_note text,
  created_at timestamptz not null default now()
);
create index if not exists insurance_customer_idx on public.insurance_policies (customer_id);

-- Messages between the customer and Blackline.
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers (id) on delete cascade,
  sender text not null check (sender in ('customer', 'blackline')),
  body text not null,
  read_by_admin boolean not null default false,
  read_by_customer boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists messages_customer_idx on public.messages (customer_id);

alter table public.customers enable row level security;
alter table public.agreements enable row level security;
alter table public.payments enable row level security;
alter table public.fees enable row level security;
alter table public.documents enable row level security;
alter table public.insurance_policies enable row level security;
alter table public.messages enable row level security;

-- Private file storage for contracts and insurance cards.
insert into storage.buckets (id, name, public, file_size_limit)
values ('portal', 'portal', false, 26214400)
on conflict (id) do nothing;
