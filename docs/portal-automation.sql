-- Automation: document auto-review, auto-sourced options, PandaDoc agreements.
alter table public.customers add column if not exists review jsonb;

alter table public.vehicle_options
  add column if not exists photo_url text,
  add column if not exists vehicle_class text,
  add column if not exists source text,
  add column if not exists lot text,
  add column if not exists listing_url text,
  add column if not exists all_in_cents int,
  add column if not exists rental_cents int,
  add column if not exists care_essential_cents int,
  add column if not exists care_plus_cents int,
  add column if not exists vin text,
  add column if not exists pandadoc_document_id text,
  add column if not exists pandadoc_status text;
