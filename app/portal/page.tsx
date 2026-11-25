import Link from "next/link";
import { CustomerShell } from "@/components/portal/CustomerShell";
import { Badge, ButtonLink, Card, Flash, Notice, Stat } from "@/components/portal/ui";
import { requireCustomer } from "@/lib/portal/session";
import { loadAgreements, loadInsurance, primaryAgreement } from "@/lib/portal/data";
import { daysBetween, denverToday, money, prettyDate, vehicleName } from "@/lib/portal/account";
import { site } from "@/lib/site";
import { SubmitButton } from "@/components/portal/SubmitButton";
import { requestPayoff } from "./actions";
import { ApplicationView } from "@/components/portal/ApplicationView";

// Room for the automatic document review that runs after Submit.
export const maxDuration = 60;

export default async function PortalHome({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const { customer } = await requireCustomer();

  if (!customer) {
    return (
      <CustomerShell customer={null} title="Your account">
        <Notice tone="warning">
          Your sign-in works, but your account isn&apos;t connected to an agreement yet. Call or
          text {site.phoneDisplay} and we&apos;ll finish setting it up.
        </Notice>
      </CustomerShell>
    );
  }

  if (customer.stage && customer.stage !== "customer") {
    const titles = {
      applicant: "Your application",
      submitted: "Your application",
      approved: "Your vehicle options",
      declined: "Your application",
    } as const;
    return (
      <CustomerShell customer={customer} title={titles[customer.stage]}>
        <Flash params={params} />
        <ApplicationView customer={customer} />
      </CustomerShell>
    );
  }

  const [accounts, insurance] = await Promise.all([
    loadAgreements(customer.id),
    loadInsurance(customer.id),
  ]);
  const account = primaryAgreement(accounts);

  if (!account) {
    return (
      <CustomerShell customer={customer} title="Your account">
        <Notice>
          Your agreement will show here once it&apos;s signed and entered. Questions? Call or text{" "}
          {site.phoneDisplay}.
        </Notice>
      </CustomerShell>
    );
  }

  const { agreement: a, summary: s } = account;
  const today = denverToday();
  const next = s.nextInstallment;
  const policy = insurance[0];
  const expiresIn = policy?.expires_on ? daysBetween(today, policy.expires_on) : null;

  return (
    <CustomerShell customer={customer} title="Your account">
      <Flash params={params} />
      {a.status === "pending" && (
        <Notice>
          Your agreement is being finalized. Payment details will appear here once your vehicle is
          delivered.
        </Notice>
      )}
      {a.status === "completed" && (
        <Notice tone="success">
          All payments are complete. Congratulations, the {vehicleName(a)} is yours. We&apos;ll be
          in touch about the title.
        </Notice>
      )}
      {a.status === "active" && s.daysLate > 0 && (
        <Notice tone={s.pastGrace ? "error" : "warning"}>
          Your payment is {s.daysLate} {s.daysLate === 1 ? "day" : "days"} past due.{" "}
          {s.pastGrace
            ? `Please pay now or call ${site.phoneDisplay} today. Late fees apply under your agreement.`
            : `Payments made within ${a.grace_days} days of the due date avoid a late fee.`}
        </Notice>
      )}
      {s.pendingTotalCents > 0 && (
        <Notice>
          {money(s.pendingTotalCents)} in bank payments is processing. Bank payments usually take 3–5
          business days to clear.
        </Notice>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Due now"
          value={money(s.amountDueNowCents)}
          tone={s.amountDueNowCents > 0 ? "alert" : "good"}
          hint={s.amountDueNowCents > 0 ? "Includes any past-due amount" : "You're all caught up"}
        />
        <Stat
          label="Next payment"
          value={next ? money(next.totalCents - next.paidCents) : "—"}
          hint={next ? `Due ${prettyDate(next.dueDate)}` : "No payments left"}
        />
        <Stat
          label="Payments made"
          value={`${s.paymentsCompleted} of ${a.term_payments}`}
          hint={`${s.paymentsRemaining} to go`}
        />
        <Stat
          label="Left to ownership"
          value={money(s.remainingToOwnershipCents)}
          hint={
            <>
              If you make every scheduled payment
              {a.status === "active" && (
                <form action={requestPayoff} className="mt-3">
                  <SubmitButton variant="secondary" pendingText="Requesting…" className="w-full !min-h-9 !px-3 !py-1.5 !text-xs">
                    Request early payoff
                  </SubmitButton>
                </form>
              )}
            </>
          }
        />
      </div>

      <Card>
        <div className="mb-2 flex justify-between text-sm font-bold">
          <span>Progress to ownership</span>
          <span>{s.progressPct}%</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-gray-200">
          <div className="h-full bg-blackline-red" style={{ width: `${s.progressPct}%` }} />
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          {a.status === "active" && <ButtonLink href="/portal/payments">Make a payment</ButtonLink>}
          <ButtonLink href="/portal/insurance" variant="secondary">
            Upload insurance
          </ButtonLink>
          <ButtonLink href="/portal/messages" variant="secondary">
            Message us
          </ButtonLink>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Your vehicle" aside={<Badge tone={a.status === "active" ? "good" : "default"}>{a.status}</Badge>}>
          <dl className="grid grid-cols-[auto,1fr] gap-x-4 gap-y-2 text-sm">
            <dt className="text-gray-500">Vehicle</dt>
            <dd className="font-semibold">{vehicleName(a)}</dd>
            <dt className="text-gray-500">VIN</dt>
            <dd className="font-mono">{a.vin || "—"}</dd>
            <dt className="text-gray-500">Agreement</dt>
            <dd>{a.agreement_number}</dd>
            <dt className="text-gray-500">Start date</dt>
            <dd>{prettyDate(a.start_date)}</dd>
            <dt className="text-gray-500">Autopay</dt>
            <dd>{a.autopay ? "On" : "Off"}</dd>
          </dl>
        </Card>

        <Card title="Your payment">
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt>Vehicle rental payment</dt>
              <dd>{money(a.rental_payment_cents)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>
                Iron Ridge Care Plan ({a.care_plan_tier})
                <span className="block text-xs text-gray-500">Provided by Iron Ridge Service LLC</span>
              </dt>
              <dd>{money(a.care_plan_cents)}</dd>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-2 font-bold">
              <dt>Total each {a.frequency === "monthly" ? "month" : a.frequency === "biweekly" ? "2 weeks" : "week"}</dt>
              <dd>{money(a.rental_payment_cents + a.care_plan_cents)}</dd>
            </div>
            {a.down_payment_cents > 0 && a.down_payment_installments > 0 && (
              <p className="text-xs text-gray-500">
                Plus your {money(a.down_payment_cents)} down payment, split across your first{" "}
                {a.down_payment_installments} payments.
              </p>
            )}
          </dl>
          {s.earlyPurchaseCents !== null && (
            <div className="mt-4 rounded-md bg-gray-50 p-3 text-sm">
              <span className="font-bold">Early purchase option (estimate): </span>
              {money(s.earlyPurchaseCents)}
              <span className="mt-1 block text-xs text-gray-500">
                Based on payments received so far, using the early purchase terms in your agreement.
                Call us for an exact payoff before you pay.
              </span>
            </div>
          )}
        </Card>
      </div>

      <Card title="Insurance">
        {!policy && (
          <Notice tone="warning">
            We don&apos;t have your proof of insurance yet. Full coverage is required, with Blackline
            Motors LLC listed as additional insured and loss payee.{" "}
            <Link href="/portal/insurance" className="font-semibold underline">
              Upload it now
            </Link>
            .
          </Notice>
        )}
        {policy && (
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="font-semibold">{policy.carrier}</span>
            <Badge tone={policy.status === "approved" ? "good" : policy.status === "rejected" ? "alert" : "warn"}>
              {policy.status === "submitted" ? "under review" : policy.status}
            </Badge>
            <span>Expires {prettyDate(policy.expires_on)}</span>
            {expiresIn !== null && expiresIn <= 30 && (
              <span className="font-semibold text-blackline-red">
                {expiresIn < 0 ? "Expired. Upload your current policy." : `Expires in ${expiresIn} days. Upload your renewal.`}
              </span>
            )}
          </div>
        )}
      </Card>
    </CustomerShell>
  );
}
