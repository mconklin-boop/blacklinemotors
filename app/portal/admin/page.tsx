import Link from "next/link";
import { AdminShell } from "@/components/portal/AdminShell";
import { Badge, Card, Flash, Label, Notice, Table, inputClass } from "@/components/portal/ui";
import { SubmitButton } from "@/components/portal/SubmitButton";
import { requireAdmin } from "@/lib/portal/session";
import { adminClient } from "@/lib/portal/supabase";
import { money, prettyDate, summarize, vehicleName } from "@/lib/portal/account";
import { portalEnabled, stripeEnabled } from "@/lib/portal/config";
import type { Agreement, Customer, Fee, Payment } from "@/lib/portal/types";
import { inviteCustomer } from "./actions";

export default async function AdminHome({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  await requireAdmin();
  const db = adminClient();
  const [c, a, p, f, m, i] = await Promise.all([
    db.from("customers").select("*").order("created_at", { ascending: false }),
    db.from("agreements").select("*"),
    db.from("payments").select("*"),
    db.from("fees").select("*"),
    db.from("messages").select("customer_id").eq("sender", "customer").eq("read_by_admin", false),
    db.from("insurance_policies").select("customer_id").eq("status", "submitted"),
  ]);
  const customers = (c.data ?? []) as Customer[];
  const agreements = (a.data ?? []) as Agreement[];
  const payments = (p.data ?? []) as Payment[];
  const fees = (f.data ?? []) as Fee[];
  const unread = new Map<string, number>();
  for (const row of (m.data ?? []) as { customer_id: string }[]) {
    unread.set(row.customer_id, (unread.get(row.customer_id) ?? 0) + 1);
  }
  const insurancePending = new Set(((i.data ?? []) as { customer_id: string }[]).map((r) => r.customer_id));

  const rows = customers.map((cust) => {
    const ag =
      agreements.find((x) => x.customer_id === cust.id && x.status === "active") ??
      agreements.find((x) => x.customer_id === cust.id);
    const summary = ag
      ? summarize(
          ag,
          payments.filter((x) => x.agreement_id === ag.id),
          fees.filter((x) => x.agreement_id === ag.id),
        )
      : null;
    return { cust, ag, summary };
  });

  const totalDue = rows.reduce((s, r) => s + (r.summary?.amountDueNowCents ?? 0), 0);

  return (
    <AdminShell title="Rent-to-own customers">
      <Flash params={params} />
      {!stripeEnabled() && (
        <Notice tone="warning">
          Online bank payments are off until the Blackline Stripe keys are added in Vercel. Customers
          see &quot;call or text to pay.&quot; You can still record payments by hand.
        </Notice>
      )}
      {!portalEnabled() && <Notice tone="error">Supabase isn&apos;t connected.</Notice>}

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Customers</span>
          <span className="block text-2xl font-bold">{customers.length}</span>
        </Card>
        <Card>
          <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Active agreements</span>
          <span className="block text-2xl font-bold">{agreements.filter((x) => x.status === "active").length}</span>
        </Card>
        <Card>
          <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Due now (all)</span>
          <span className={`block text-2xl font-bold ${totalDue > 0 ? "text-blackline-red" : ""}`}>{money(totalDue)}</span>
        </Card>
      </div>

      <Card title="Customers">
        {rows.length === 0 ? (
          <p className="text-sm text-gray-600">No customers yet. Invite your first one below.</p>
        ) : (
          <Table head={["Customer", "Vehicle", "Status", "Due now", "Next due", "Flags"]}>
            {rows.map(({ cust, ag, summary }) => (
              <tr key={cust.id}>
                <td className="px-2 py-2">
                  <Link href={`/portal/admin/customers/${cust.id}`} className="font-semibold underline">
                    {cust.full_name}
                  </Link>
                  <span className="block text-xs text-gray-500">{cust.email}</span>
                </td>
                <td className="px-2 py-2">{ag ? vehicleName(ag) : "—"}</td>
                <td className="px-2 py-2">{ag ? <Badge>{ag.status}</Badge> : <Badge tone="warn">no agreement</Badge>}</td>
                <td className={`px-2 py-2 font-semibold ${summary && summary.amountDueNowCents > 0 ? "text-blackline-red" : ""}`}>
                  {summary ? money(summary.amountDueNowCents) : "—"}
                  {summary && summary.daysLate > 0 && (
                    <span className="block text-xs">{summary.daysLate} days late</span>
                  )}
                </td>
                <td className="px-2 py-2">{summary?.nextInstallment ? prettyDate(summary.nextInstallment.dueDate) : "—"}</td>
                <td className="space-x-1 px-2 py-2">
                  {(unread.get(cust.id) ?? 0) > 0 && <Badge tone="alert">{unread.get(cust.id)} msg</Badge>}
                  {insurancePending.has(cust.id) && <Badge tone="warn">insurance</Badge>}
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Card>

      <Card title="Invite a customer">
        <p className="mb-4 text-sm text-gray-600">
          Creates their portal login and emails them a link to set a password. Add their agreement
          on the next screen.
        </p>
        <form action={inviteCustomer} className="grid gap-4 sm:grid-cols-3">
          <Label text="Full name">
            <input name="full_name" required className={inputClass} />
          </Label>
          <Label text="Email">
            <input name="email" type="email" required className={inputClass} />
          </Label>
          <Label text="Phone">
            <input name="phone" type="tel" className={inputClass} />
          </Label>
          <div className="sm:col-span-3">
            <SubmitButton pendingText="Sending invite…">Create login and send invite</SubmitButton>
          </div>
        </form>
      </Card>
    </AdminShell>
  );
}
