import Link from "next/link";
import { notFound } from "next/navigation";
import { clsx } from "clsx";
import { AdminShell } from "@/components/portal/AdminShell";
import { Badge, Card, Flash, Label, Notice, Stat, Table, inputClass } from "@/components/portal/ui";
import { SubmitButton } from "@/components/portal/SubmitButton";
import { UploadForm } from "@/components/portal/UploadForm";
import { requireAdmin } from "@/lib/portal/session";
import { adminClient } from "@/lib/portal/supabase";
import {
  loadAgreements,
  loadDocuments,
  loadInsurance,
  loadMessages,
  primaryAgreement,
} from "@/lib/portal/data";
import {
  denverToday,
  feeLabels,
  methodLabels,
  money,
  prettyDate,
  vehicleName,
} from "@/lib/portal/account";
import type { Agreement, Customer } from "@/lib/portal/types";
import {
  addDocument,
  addFee,
  createDocumentUpload,
  recordPayment,
  replyMessage,
  reviewInsurance,
  saveAgreement,
  sendPasswordLink,
  setPaymentStatus,
  toggleFeeWaived,
  updateCustomer,
  updateDocument,
} from "../../actions";

const dollars = (cents: number | null | undefined) =>
  cents === null || cents === undefined ? "" : (cents / 100).toFixed(2);

function AgreementForm({ customerId, a }: { customerId: string; a?: Agreement }) {
  return (
    <form action={saveAgreement} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <input type="hidden" name="customer_id" value={customerId} />
      {a && <input type="hidden" name="agreement_id" value={a.id} />}
      <Label text="Agreement #">
        <input name="agreement_number" required defaultValue={a?.agreement_number} placeholder="BLM-RTO-0001" className={inputClass} />
      </Label>
      <Label text="Status">
        <select name="status" defaultValue={a?.status ?? "pending"} className={inputClass}>
          {["pending", "active", "completed", "returned", "terminated"].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </Label>
      <Label text="Start / delivery date">
        <input name="start_date" type="date" defaultValue={a?.start_date ?? ""} className={inputClass} />
      </Label>
      <Label text="First payment due">
        <input name="first_due_date" type="date" required defaultValue={a?.first_due_date} className={inputClass} />
      </Label>

      <Label text="Year">
        <input name="vehicle_year" inputMode="numeric" defaultValue={a?.vehicle_year ?? ""} className={inputClass} />
      </Label>
      <Label text="Make">
        <input name="vehicle_make" defaultValue={a?.vehicle_make ?? ""} className={inputClass} />
      </Label>
      <Label text="Model">
        <input name="vehicle_model" defaultValue={a?.vehicle_model ?? ""} className={inputClass} />
      </Label>
      <Label text="Trim">
        <input name="vehicle_trim" defaultValue={a?.vehicle_trim ?? ""} className={inputClass} />
      </Label>
      <div className="sm:col-span-2">
        <Label text="VIN">
          <input name="vin" defaultValue={a?.vin ?? ""} className={`${inputClass} font-mono uppercase`} />
        </Label>
      </div>
      <Label text="Frequency">
        <select name="frequency" defaultValue={a?.frequency ?? "monthly"} className={inputClass}>
          <option value="monthly">monthly</option>
          <option value="biweekly">every 2 weeks</option>
          <option value="weekly">weekly</option>
        </select>
      </Label>
      <Label text="Number of payments">
        <input name="term_payments" inputMode="numeric" required defaultValue={a?.term_payments ?? 24} className={inputClass} />
      </Label>

      <Label text="Rental payment ($)">
        <input name="rental_payment" inputMode="decimal" required defaultValue={dollars(a?.rental_payment_cents ?? 56100)} className={inputClass} />
      </Label>
      <Label text="Care Plan tier">
        <select name="care_plan_tier" defaultValue={a?.care_plan_tier ?? "Essential"} className={inputClass}>
          <option>Essential</option>
          <option>Plus</option>
        </select>
      </Label>
      <Label text="Care Plan per payment ($)">
        <input name="care_plan" inputMode="decimal" required defaultValue={dollars(a?.care_plan_cents ?? 3900)} className={inputClass} />
      </Label>
      <Label text="Cash price ($)" hint="Used for the early purchase estimate">
        <input name="cash_price" inputMode="decimal" defaultValue={dollars(a?.cash_price_cents ?? 900000)} className={inputClass} />
      </Label>

      <Label text="Down payment ($)">
        <input name="down_payment" inputMode="decimal" defaultValue={dollars(a?.down_payment_cents ?? 0)} className={inputClass} />
      </Label>
      <Label text="Split down payment over" hint="Number of first payments (0 = paid up front)">
        <input name="down_payment_installments" inputMode="numeric" defaultValue={a?.down_payment_installments ?? 0} className={inputClass} />
      </Label>
      <Label text="Late fee ($)">
        <input name="late_fee" inputMode="decimal" defaultValue={dollars(a?.late_fee_cents ?? 2500)} className={inputClass} />
      </Label>
      <Label text="Grace days">
        <input name="grace_days" inputMode="numeric" defaultValue={a?.grace_days ?? 7} className={inputClass} />
      </Label>
      <Label text="Early purchase credit (%)" hint="% of rental payments credited">
        <input name="early_purchase_credit_pct" inputMode="decimal" defaultValue={a?.early_purchase_credit_pct ?? 50} className={inputClass} />
      </Label>
      <label className="flex items-center gap-2 self-end pb-3 text-sm font-bold">
        <input type="checkbox" name="autopay" defaultChecked={a?.autopay} /> Autopay on
      </label>
      <div className="sm:col-span-2">
        <Label text="Private notes (admin only)">
          <input name="notes" defaultValue={a?.notes ?? ""} className={inputClass} />
        </Label>
      </div>
      <div className="sm:col-span-2 lg:col-span-4">
        <SubmitButton pendingText="Saving…">{a ? "Save agreement" : "Create agreement"}</SubmitButton>
      </div>
    </form>
  );
}

export default async function AdminCustomerPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const flash = await searchParams;
  await requireAdmin();
  const db = adminClient();
  const { data } = await db.from("customers").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  const customer = data as Customer;

  const [accounts, docs, policies, messages] = await Promise.all([
    loadAgreements(id),
    loadDocuments(id, true),
    loadInsurance(id),
    loadMessages(id),
  ]);
  if (messages.some((m) => m.sender === "customer" && !m.read_by_admin)) {
    await db.from("messages").update({ read_by_admin: true }).eq("customer_id", id).eq("sender", "customer");
  }
  const account = primaryAgreement(accounts);
  const today = denverToday();

  return (
    <AdminShell title={customer.full_name}>
      <Flash params={flash} />

      {account && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat
            label="Due now"
            value={money(account.summary.amountDueNowCents)}
            tone={account.summary.amountDueNowCents > 0 ? "alert" : "good"}
            hint={account.summary.daysLate > 0 ? `${account.summary.daysLate} days late (grace ${account.agreement.grace_days})` : "Current"}
          />
          <Stat
            label="Next due"
            value={account.summary.nextInstallment ? prettyDate(account.summary.nextInstallment.dueDate) : "—"}
            hint={account.summary.nextInstallment ? money(account.summary.nextInstallment.totalCents - account.summary.nextInstallment.paidCents) : undefined}
          />
          <Stat label="Payments made" value={`${account.summary.paymentsCompleted} / ${account.agreement.term_payments}`} hint={`Received ${money(account.summary.paidTotalCents)}`} />
          <Stat
            label="Early purchase est."
            value={account.summary.earlyPurchaseCents !== null ? money(account.summary.earlyPurchaseCents) : "—"}
            hint={`Open fees ${money(account.summary.feesOpenCents)}`}
          />
        </div>
      )}
      {account && account.summary.pastGrace && account.agreement.status === "active" && (
        <Notice tone="error">
          Past the {account.agreement.grace_days}-day grace period. Add the late fee below if it applies, and follow your
          contract&apos;s notice steps before any starter interrupt.
        </Notice>
      )}

      <Card title={account ? `Agreement ${account.agreement.agreement_number} · ${vehicleName(account.agreement)}` : "Create agreement"}>
        <AgreementForm customerId={id} a={account?.agreement} />
        {accounts.length > 1 && (
          <p className="mt-3 text-xs text-gray-500">This customer has {accounts.length} agreements. The active one is shown.</p>
        )}
      </Card>

      {account && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card title="Record a payment">
            <form action={recordPayment} className="grid gap-3 sm:grid-cols-2">
              <input type="hidden" name="customer_id" value={id} />
              <input type="hidden" name="agreement_id" value={account.agreement.id} />
              <Label text="Amount ($)">
                <input
                  name="amount"
                  inputMode="decimal"
                  required
                  defaultValue={dollars(account.agreement.rental_payment_cents + account.agreement.care_plan_cents)}
                  className={inputClass}
                />
              </Label>
              <Label text="Date received">
                <input name="paid_on" type="date" defaultValue={today} className={inputClass} />
              </Label>
              <Label text="Method">
                <select name="method" defaultValue="cash" className={inputClass}>
                  {Object.entries(methodLabels).map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
              </Label>
              <Label text="Reference / check #">
                <input name="reference" className={inputClass} />
              </Label>
              <div className="sm:col-span-2">
                <Label text="Note">
                  <input name="note" className={inputClass} />
                </Label>
              </div>
              <div className="sm:col-span-2">
                <SubmitButton pendingText="Saving…">Record payment</SubmitButton>
              </div>
            </form>
          </Card>

          <Card title="Add a fee">
            <form action={addFee} className="grid gap-3 sm:grid-cols-2">
              <input type="hidden" name="customer_id" value={id} />
              <input type="hidden" name="agreement_id" value={account.agreement.id} />
              <Label text="Type">
                <select name="kind" className={inputClass}>
                  {Object.entries(feeLabels).map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
              </Label>
              <Label text="Amount ($)">
                <input name="amount" inputMode="decimal" required defaultValue={dollars(account.agreement.late_fee_cents)} className={inputClass} />
              </Label>
              <Label text="Date">
                <input name="assessed_on" type="date" defaultValue={today} className={inputClass} />
              </Label>
              <Label text="Description">
                <input name="description" placeholder="e.g. Payment due Jan 5" className={inputClass} />
              </Label>
              <div className="sm:col-span-2">
                <SubmitButton pendingText="Saving…">Add fee</SubmitButton>
              </div>
            </form>
            <p className="mt-3 text-xs text-gray-500">
              Contract amounts: late $25, returned payment $25, reinstatement $50.
            </p>
          </Card>
        </div>
      )}

      {account && (
        <Card title="Payments">
          {account.payments.length === 0 ? (
            <p className="text-sm text-gray-600">No payments yet.</p>
          ) : (
            <Table head={["Date", "Amount", "Method", "Status", "Ref / note", ""]}>
              {account.payments.map((p) => (
                <tr key={p.id}>
                  <td className="px-2 py-2">{prettyDate(p.paid_on)}</td>
                  <td className="px-2 py-2 font-semibold">{money(p.amount_cents)}</td>
                  <td className="px-2 py-2">{methodLabels[p.method]}</td>
                  <td className="px-2 py-2">
                    <Badge tone={p.status === "succeeded" ? "good" : p.status === "pending" ? "warn" : "alert"}>{p.status}</Badge>
                  </td>
                  <td className="px-2 py-2 text-xs text-gray-600">
                    {[p.reference, p.note, p.stripe_payment_intent].filter(Boolean).join(" · ")}
                  </td>
                  <td className="px-2 py-2">
                    <form action={setPaymentStatus} className="flex gap-1">
                      <input type="hidden" name="customer_id" value={id} />
                      <input type="hidden" name="payment_id" value={p.id} />
                      <select name="status" defaultValue="" className="rounded border border-gray-300 px-1 py-1 text-xs">
                        <option value="" disabled>Change…</option>
                        <option value="succeeded">received</option>
                        <option value="pending">pending</option>
                        <option value="failed">failed / returned</option>
                        <option value="refunded">refunded</option>
                        <option value="delete">delete</option>
                      </select>
                      <button className="rounded border border-gray-300 px-2 text-xs font-bold">Go</button>
                    </form>
                  </td>
                </tr>
              ))}
            </Table>
          )}
        </Card>
      )}

      {account && account.fees.length > 0 && (
        <Card title="Fees">
          <Table head={["Date", "Fee", "Amount", ""]}>
            {account.fees.map((f) => (
              <tr key={f.id} className={clsx(f.waived && "text-gray-400 line-through")}>
                <td className="px-2 py-2">{prettyDate(f.assessed_on)}</td>
                <td className="px-2 py-2">{feeLabels[f.kind]} {f.description && `· ${f.description}`}</td>
                <td className="px-2 py-2">{money(f.amount_cents)}</td>
                <td className="px-2 py-2 no-underline">
                  <form action={toggleFeeWaived}>
                    <input type="hidden" name="customer_id" value={id} />
                    <input type="hidden" name="fee_id" value={f.id} />
                    <input type="hidden" name="waived" value={f.waived ? "false" : "true"} />
                    <button className="text-xs font-bold underline">{f.waived ? "Restore" : "Waive"}</button>
                  </form>
                </td>
              </tr>
            ))}
          </Table>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Documents">
          <UploadForm
            getUploadUrl={createDocumentUpload}
            extraUploadArg={id}
            onSubmit={addDocument}
            fileLabel="File (PDF or image)"
            submitLabel="Upload document"
          >
            <input type="hidden" name="customer_id" value={id} />
            {account && <input type="hidden" name="agreement_id" value={account.agreement.id} />}
            <Label text="Title">
              <input name="title" required placeholder="Signed Rental-Purchase Agreement" className={inputClass} />
            </Label>
            <label className="flex items-center gap-2 text-sm font-bold">
              <input type="checkbox" name="visible_to_customer" defaultChecked /> Customer can see it
            </label>
          </UploadForm>
          {docs.length > 0 && (
            <ul className="mt-5 divide-y divide-gray-100 border-t border-gray-200 text-sm">
              {docs.map((d) => (
                <li key={d.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                  <span>
                    {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
                    <a href={`/portal/documents/${d.id}`} className="font-semibold underline">{d.title}</a>
                    {!d.visible_to_customer && <Badge tone="warn">hidden</Badge>}
                  </span>
                  <form action={updateDocument} className="flex gap-2">
                    <input type="hidden" name="customer_id" value={id} />
                    <input type="hidden" name="document_id" value={d.id} />
                    <button name="op" value={d.visible_to_customer ? "hide" : "show"} className="text-xs font-bold underline">
                      {d.visible_to_customer ? "Hide" : "Show"}
                    </button>
                    <button name="op" value="delete" className="text-xs font-bold text-blackline-red underline">Delete</button>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Insurance">
          {policies.length === 0 ? (
            <p className="text-sm text-gray-600">Nothing uploaded yet.</p>
          ) : (
            <ul className="space-y-4 text-sm">
              {policies.map((p) => (
                <li key={p.id} className="rounded-md border border-gray-200 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-semibold">{p.carrier} {p.policy_number && `· ${p.policy_number}`}</span>
                    <Badge tone={p.status === "approved" ? "good" : p.status === "rejected" ? "alert" : "warn"}>{p.status}</Badge>
                  </div>
                  <p className="text-gray-600">
                    {prettyDate(p.effective_on)} to {prettyDate(p.expires_on)}
                    {p.expires_on && p.expires_on < today && <span className="ml-2 font-bold text-blackline-red">EXPIRED</span>}
                  </p>
                  {p.storage_path && (
                    <a href={`/portal/admin/files?path=${encodeURIComponent(p.storage_path)}`} target="_blank" rel="noreferrer" className="font-semibold underline">
                      View uploaded card
                    </a>
                  )}
                  <form action={reviewInsurance} className="mt-2 flex flex-wrap gap-2">
                    <input type="hidden" name="customer_id" value={id} />
                    <input type="hidden" name="policy_id" value={p.id} />
                    <input name="review_note" placeholder="Note to customer (optional)" defaultValue={p.review_note ?? ""} className="min-w-0 flex-1 rounded border border-gray-300 px-2 py-1" />
                    <button name="status" value="approved" className="rounded bg-green-700 px-3 py-1 text-xs font-bold text-white">Approve</button>
                    <button name="status" value="rejected" className="rounded bg-blackline-red px-3 py-1 text-xs font-bold text-white">Reject</button>
                  </form>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-3 text-xs text-gray-500">Check that Blackline Motors LLC is listed as additional insured and loss payee before approving.</p>
        </Card>
      </div>

      <Card title="Messages">
        <div className="max-h-[400px] space-y-3 overflow-y-auto">
          {messages.length === 0 && <p className="text-sm text-gray-600">No messages yet.</p>}
          {messages.map((m) => (
            <div
              key={m.id}
              className={clsx(
                "max-w-[85%] rounded-md px-4 py-3 text-sm",
                m.sender === "blackline" ? "ml-auto bg-blackline-black text-white" : "bg-gray-100",
              )}
            >
              <p className="whitespace-pre-wrap">{m.body}</p>
              <span className="mt-1 block text-xs opacity-60">
                {m.sender === "blackline" ? "Blackline" : customer.full_name} ·{" "}
                {new Date(m.created_at).toLocaleString("en-US", { timeZone: "America/Denver", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
              </span>
            </div>
          ))}
        </div>
        <form action={replyMessage} className="mt-4 space-y-3 border-t border-gray-200 pt-4">
          <input type="hidden" name="customer_id" value={id} />
          <textarea name="body" rows={3} required className={inputClass} placeholder="Reply as Blackline Motors" />
          <SubmitButton pendingText="Sending…">Send reply</SubmitButton>
        </form>
      </Card>

      <Card title="Customer info">
        <form action={updateCustomer} className="grid gap-3 sm:grid-cols-3">
          <input type="hidden" name="customer_id" value={id} />
          <Label text="Full name"><input name="full_name" required defaultValue={customer.full_name} className={inputClass} /></Label>
          <Label text="Email (login)"><input defaultValue={customer.email} disabled className={`${inputClass} bg-gray-100`} /></Label>
          <Label text="Phone"><input name="phone" defaultValue={customer.phone ?? ""} className={inputClass} /></Label>
          <Label text="Street"><input name="address_line1" defaultValue={customer.address_line1 ?? ""} className={inputClass} /></Label>
          <Label text="Apt / unit"><input name="address_line2" defaultValue={customer.address_line2 ?? ""} className={inputClass} /></Label>
          <Label text="City"><input name="city" defaultValue={customer.city ?? ""} className={inputClass} /></Label>
          <Label text="State"><input name="state" defaultValue={customer.state ?? "CO"} className={inputClass} /></Label>
          <Label text="ZIP"><input name="zip" defaultValue={customer.zip ?? ""} className={inputClass} /></Label>
          <div className="self-end"><SubmitButton pendingText="Saving…">Save</SubmitButton></div>
        </form>
        <form action={sendPasswordLink} className="mt-4 flex flex-wrap items-center gap-3 border-t border-gray-200 pt-4 text-sm">
          <input type="hidden" name="customer_id" value={id} />
          <input type="hidden" name="email" value={customer.email} />
          <SubmitButton variant="secondary" pendingText="Sending…">Send password link</SubmitButton>
          <span className="text-gray-600">Use if the invite expired or they forgot their password.</span>
        </form>
        <p className="mt-3 text-xs text-gray-500">
          Stripe customer: {customer.stripe_customer_id ?? "not created yet (made on first online payment)"} ·{" "}
          <Link href="/portal/admin" className="underline">Back to all customers</Link>
        </p>
      </Card>
    </AdminShell>
  );
}
