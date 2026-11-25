import { CustomerShell } from "@/components/portal/CustomerShell";
import { Badge, Card, Flash, Label, Notice, Table, inputClass } from "@/components/portal/ui";
import { SubmitButton } from "@/components/portal/SubmitButton";
import { requireCustomer } from "@/lib/portal/session";
import { loadAgreements, primaryAgreement } from "@/lib/portal/data";
import { feeLabels, methodLabels, money, prettyDate } from "@/lib/portal/account";
import { stripeEnabled } from "@/lib/portal/config";
import { site } from "@/lib/site";
import { startPayment } from "../actions";

const stateTone = {
  paid: "good",
  late: "alert",
  due: "warn",
  partial: "warn",
  upcoming: "default",
} as const;

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const { customer } = await requireCustomer();
  const account = customer ? primaryAgreement(await loadAgreements(customer.id)) : null;

  if (!customer || !account) {
    return (
      <CustomerShell customer={customer} title="Payments">
        <Notice>Your payment schedule will appear here once your agreement is entered.</Notice>
      </CustomerShell>
    );
  }

  const { agreement: a, summary: s, payments, fees } = account;
  const suggested = s.amountDueNowCents > 0
    ? s.amountDueNowCents
    : s.nextInstallment
      ? s.nextInstallment.totalCents - s.nextInstallment.paidCents
      : 0;

  return (
    <CustomerShell customer={customer} title="Payments">
      <Flash params={params} />
      {params.paid === "1" && (
        <Notice tone="success">
          Thanks! Your bank payment was submitted. It shows as processing until your bank clears it,
          usually 3–5 business days.
        </Notice>
      )}

      {a.status === "active" && (
        <Card title="Make a payment">
          {stripeEnabled() ? (
            <form action={startPayment} className="flex flex-wrap items-end gap-4">
              <div className="w-48">
                <Label text="Amount">
                  <input
                    name="amount"
                    inputMode="decimal"
                    defaultValue={(suggested / 100).toFixed(2)}
                    required
                    className={inputClass}
                  />
                </Label>
              </div>
              <SubmitButton pendingText="Opening secure checkout…">Pay from my bank</SubmitButton>
              <p className="w-full text-xs text-gray-500">
                Payments are made by bank transfer (ACH) through Stripe&apos;s secure checkout. We
                don&apos;t take card payments. A returned payment fee applies if your bank sends a
                payment back.
              </p>
            </form>
          ) : (
            <Notice>
              Online bank payments are coming soon. For now, call or text {site.phoneDisplay} to
              make a payment.
            </Notice>
          )}
        </Card>
      )}

      <Card title="Payment history">
        {payments.length === 0 ? (
          <p className="text-sm text-gray-600">No payments yet.</p>
        ) : (
          <Table head={["Date", "Amount", "Method", "Status"]}>
            {payments.map((p) => (
              <tr key={p.id}>
                <td className="px-2 py-2">{prettyDate(p.paid_on)}</td>
                <td className="px-2 py-2 font-semibold">{money(p.amount_cents)}</td>
                <td className="px-2 py-2">{methodLabels[p.method]}</td>
                <td className="px-2 py-2">
                  <Badge tone={p.status === "succeeded" ? "good" : p.status === "pending" ? "warn" : "alert"}>
                    {p.status === "succeeded" ? "received" : p.status === "pending" ? "processing" : p.status}
                  </Badge>
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Card>

      {fees.length > 0 && (
        <Card title="Fees">
          <Table head={["Date", "Fee", "Amount", ""]}>
            {fees.map((f) => (
              <tr key={f.id}>
                <td className="px-2 py-2">{prettyDate(f.assessed_on)}</td>
                <td className="px-2 py-2">
                  {feeLabels[f.kind]}
                  {f.description && <span className="block text-xs text-gray-500">{f.description}</span>}
                </td>
                <td className="px-2 py-2">{money(f.amount_cents)}</td>
                <td className="px-2 py-2">{f.waived && <Badge tone="good">waived</Badge>}</td>
              </tr>
            ))}
          </Table>
        </Card>
      )}

      <Card title="Payment schedule">
        <Table head={["#", "Due", "Rental", "Care Plan", "Total", "Status"]}>
          {s.schedule.map((i) => (
            <tr key={i.number}>
              <td className="px-2 py-2">{i.number}</td>
              <td className="px-2 py-2">{prettyDate(i.dueDate)}</td>
              <td className="px-2 py-2">
                {money(i.rentalCents)}
                {i.downPaymentCents > 0 && (
                  <span className="block text-xs text-gray-500">+ {money(i.downPaymentCents)} down</span>
                )}
              </td>
              <td className="px-2 py-2">{money(i.carePlanCents)}</td>
              <td className="px-2 py-2 font-semibold">{money(i.totalCents)}</td>
              <td className="px-2 py-2">
                <Badge tone={stateTone[i.state]}>
                  {i.state === "late" ? "past due" : i.state === "partial" ? "partly paid" : i.state}
                </Badge>
              </td>
            </tr>
          ))}
        </Table>
        <p className="mt-3 text-xs text-gray-500">
          Payments are applied to the oldest scheduled payment first, then to any fees. Your signed
          agreement controls if anything here differs from it.
        </p>
      </Card>
    </CustomerShell>
  );
}
