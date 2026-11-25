# Customer portal setup

The portal lives at `/portal`. Customers sign in with email and password, see
their payment schedule, history, balance to ownership, fees, documents and
insurance status, update contact info, and message Blackline. The admin side
is at `/portal/admin` (only emails in `PORTAL_ADMIN_EMAILS`).

## 1. Supabase (database, logins, file storage)

1. In Vercel → `blacklinemotors` project → **Storage / Integrations → Supabase**,
   create a new project named **blackline-portal** (region: US West or US
   East) and connect it to this project for Production and Preview. This adds
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` and
   `SUPABASE_SERVICE_ROLE_KEY` automatically.
2. In Supabase → **SQL Editor**, paste and run `docs/portal-schema.sql`.
3. Supabase → **Authentication → Sign In / Providers**: keep Email on,
   **turn OFF "Allow new users to sign up"** (customers are invited only).
4. Supabase → **Authentication → URL Configuration**:
   - Site URL: `https://www.blacklinemotorsco.com`
   - Redirect URLs: `https://www.blacklinemotorsco.com/portal/set-password`
     and `https://*-conklin-investments.vercel.app/portal/set-password`
5. Supabase → **Authentication → Users → Add user → Create new user**:
   **mike@blacklinemotorsco.com** with a strong password, auto-confirm on.
   This is the admin login.
6. Optional but recommended: Supabase → **Authentication → Emails → SMTP**,
   send from `mike@blacklinemotorsco.com` (Google Workspace SMTP) so invites
   come from Blackline instead of Supabase's default sender, which is
   limited to a few emails per hour.

## 2. Vercel environment variables

| Name | Value |
|---|---|
| `PORTAL_ADMIN_EMAILS` | `mike@blacklinemotorsco.com` |
| `STRIPE_SECRET_KEY` | Blackline Motors LLC Stripe secret key (`sk_live_…`, or `sk_test_…` to test) |
| `STRIPE_WEBHOOK_SECRET` | `whsec_…` from step 3 |

Redeploy after adding variables.

## 3. Stripe (bank payments only)

Use a **separate Stripe account for Blackline Motors LLC** (same Stripe login,
"New account" in the account switcher), with the Blackline LLC bank account
for payouts.

1. Settings → Payment methods: turn on **ACH Direct Debit**. Turn cards off.
2. Developers → Webhooks → Add endpoint:
   `https://www.blacklinemotorsco.com/api/portal/stripe-webhook`
   Events: `checkout.session.completed`,
   `checkout.session.async_payment_succeeded`,
   `checkout.session.async_payment_failed`.
3. Copy the signing secret into `STRIPE_WEBHOOK_SECRET`.

Until both Stripe variables are set, customers see "call or text to pay" and
you record payments by hand from the admin page.

## 4. Onboarding a customer (e.g. Brandon)

1. `/portal/admin` → Invite a customer (name, email, phone). They get an
   email to set their password.
2. Open the customer → fill in the agreement (number, vehicle, VIN, first
   due date, $561 rental + $39 Essential Care Plan, 24 monthly payments,
   $9,000 cash price, late fee $25, 7 grace days, 50% early purchase credit)
   and set status to **active** at delivery.
3. Upload the signed PandaDoc PDF under Documents.
4. Approve their insurance once they upload it (check Blackline Motors LLC is
   additional insured and loss payee).

## How the numbers work

- Schedule = rental + Care Plan (+ any down payment split over the first
  payments) for each payment date.
- Payments apply to the oldest scheduled payment first, then fees.
- "Due now" = scheduled amounts due on or before today + open fees − what's
  been received or is processing.
- Fees are added by hand (nothing is charged automatically).
- Early purchase estimate = lesser of (cash price − credit % × rental
  payments made) or rental payments remaining. Care Plan is excluded.
