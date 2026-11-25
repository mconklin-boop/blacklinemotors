-- Online applications: applicants get a portal login when they pre-qualify,
-- upload documents, get a decision, and pick from vehicle options.
-- Run once in the Supabase SQL editor (blackline-portal).

alter table public.customers
  add column if not exists stage text not null default 'customer',
  add column if not exists application jsonb not null default '{}'::jsonb,
  add column if not exists language text not null default 'en',
  add column if not exists submitted_at timestamptz,
  add column if not exists decided_at timestamptz,
  add column if not exists decision_note text,
  add column if not exists purge_warned_at timestamptz;

do $$ begin
  alter table public.customers add constraint customers_stage_check
    check (stage in ('applicant', 'submitted', 'approved', 'declined', 'customer'));
exception when duplicate_object then null; end $$;

-- license / income / residence for application uploads; null for other files.
alter table public.documents add column if not exists kind text;

-- Vehicles offered to an approved applicant. Each sent option is good for 24 hours.
create table if not exists public.vehicle_options (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers (id) on delete cascade,
  status text not null default 'draft'
    check (status in ('draft', 'offered', 'selected', 'not_selected', 'expired', 'withdrawn')),
  vehicle_year int,
  vehicle_make text not null,
  vehicle_model text not null,
  vehicle_trim text,
  mileage int,
  photo_path text,
  description text,
  cash_price_cents int,
  down_payment_cents int not null default 0,
  payment_cents int not null,
  frequency text not null default 'monthly' check (frequency in ('monthly', 'biweekly', 'weekly')),
  term_payments int,
  care_plan_note text,
  sent_at timestamptz,
  expires_at timestamptz,
  selected_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists vehicle_options_customer_idx on public.vehicle_options (customer_id);
alter table public.vehicle_options enable row level security;
