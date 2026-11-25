import { Badge, Card, Label, Notice, Table, inputClass } from "./ui";
import { SubmitButton } from "./SubmitButton";
import { UploadForm } from "./UploadForm";
import { money } from "@/lib/portal/account";
import {
  DOC_KINDS,
  applicationChecklist,
  daysLeftToSubmit,
  effectiveStatus,
  loadOptions,
  optionName,
  optionTerms,
  prettyDateTime,
} from "@/lib/portal/applications";
import {
  addVehicleOption,
  createOptionPhotoUpload,
  decideApplication,
  removeOption,
  sendOptions,
} from "@/app/portal/admin/application-actions";
import type { Customer, PortalDocument } from "@/lib/portal/types";

const stageLabel = {
  applicant: ["Not submitted", "warn"],
  submitted: ["Ready to review", "alert"],
  approved: ["Approved", "good"],
  declined: ["Declined", "default"],
  customer: ["Customer", "good"],
} as const;

const statusTone = {
  draft: "warn",
  offered: "alert",
  selected: "good",
  not_selected: "default",
  expired: "default",
  withdrawn: "default",
} as const;

export async function ApplicationAdmin({ customer, docs }: { customer: Customer; docs: PortalDocument[] }) {
  const app = customer.application ?? {};
  const appDocs = docs.filter((d) => d.kind);
  const check = applicationChecklist(app, appDocs);
  const options = customer.stage === "approved" ? await loadOptions(customer.id, true) : [];
  const drafts = options.filter((o) => o.status === "draft");
  const [label, tone] = stageLabel[customer.stage];

  return (
    <div id="application" className="space-y-6">
      <Card title="Application" aside={<Badge tone={tone}>{label}</Badge>}>
        {customer.stage === "applicant" && (
          <Notice tone="warning">
            {customer.submitted_at
              ? "Sent back for more info. Waiting on the applicant to resubmit."
              : `Not submitted yet. Auto-deletes in ${daysLeftToSubmit(customer)} days if not submitted.`}
          </Notice>
        )}
        <div className="mt-4 grid gap-6 lg:grid-cols-3">
          <dl className="space-y-2 text-sm">
            {[
              ["Monthly income", app.monthlyIncome],
              ["Time at job", app.timeAtJob],
              ["Employer", [app.employer, app.jobTitle].filter(Boolean).join(" · ")],
              ["Employer phone", app.employerPhone],
              ["Time at address", app.timeAtAddress],
              ["Wants", app.vehicleWanted],
              ["Applied", prettyDateTime(customer.created_at)],
              ["Submitted", prettyDateTime(customer.submitted_at)],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-3 border-b border-gray-100 pb-1">
                <dt className="text-gray-500">{k}</dt>
                <dd className="text-right font-semibold">{v || "—"}</dd>
              </div>
            ))}
          </dl>
          <div className="text-sm">
            <p className="mb-2 font-bold">References</p>
            {(app.references ?? []).length === 0 && <p className="text-gray-500">None yet.</p>}
            <ul className="space-y-2">
              {(app.references ?? []).map((r, i) => (
                <li key={i}>
                  <span className="font-semibold">{r.name}</span>
                  {r.relationship && <span className="text-gray-500"> ({r.relationship})</span>}
                  <br />
                  <a href={`tel:${r.phone}`} className="underline">{r.phone}</a>
                </li>
              ))}
            </ul>
          </div>
          <div className="text-sm">
            <p className="mb-2 font-bold">Documents</p>
            <ul className="space-y-2">
              {DOC_KINDS.map((def) => {
                const mine = appDocs.filter((d) => d.kind === def.kind);
                return (
                  <li key={def.kind}>
                    <span className={check[def.kind] ? "font-semibold" : "font-semibold text-blackline-red"}>
                      {def.title}
                    </span>
                    {mine.length === 0 ? (
                      <span className="text-gray-500"> · missing</span>
                    ) : (
                      mine.map((d, i) => (
                        <span key={d.id}>
                          {" · "}
                          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
                          <a href={`/portal/documents/${d.id}`} target="_blank" className="underline">
                            file {i + 1}
                          </a>
                        </span>
                      ))
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <form action={decideApplication} className="mt-6 grid gap-4 border-t border-gray-200 pt-5 sm:grid-cols-[220px_1fr_auto] sm:items-end">
          <input type="hidden" name="customer_id" value={customer.id} />
          <Label text="Decision">
            <select name="decision" defaultValue="" required className={inputClass}>
              <option value="" disabled>Choose…</option>
              <option value="approve">Approve</option>
              <option value="more_info">Need more info</option>
              <option value="decline">Decline</option>
            </select>
          </Label>
          <Label text="Note to applicant (shown in their portal and email)">
            <input name="note" maxLength={1000} placeholder="Optional for approve/decline; required for more info" className={inputClass} />
          </Label>
          <SubmitButton pendingText="Saving…">Save decision</SubmitButton>
        </form>
        {customer.decision_note && (
          <p className="mt-3 text-xs text-gray-500">
            Last note ({prettyDateTime(customer.decided_at)}): {customer.decision_note}
          </p>
        )}
      </Card>

      {customer.stage === "approved" && (
        <Card
          title="Vehicle options"
          aside={
            drafts.length > 0 ? (
              <form action={sendOptions}>
                <input type="hidden" name="customer_id" value={customer.id} />
                <SubmitButton pendingText="Sending…">
                  Send {drafts.length} option{drafts.length === 1 ? "" : "s"} (24 hr)
                </SubmitButton>
              </form>
            ) : undefined
          }
        >
          {options.length > 0 && (
            <div className="mb-6">
              <Table head={["Vehicle", "Terms", "Status", "Expires", ""]}>
                {options.map((o) => {
                  const st = effectiveStatus(o);
                  return (
                    <tr key={o.id}>
                      <td className="px-2 py-2 font-semibold">
                        {optionName(o)}
                        {o.mileage !== null && <span className="block text-xs text-gray-500">{o.mileage.toLocaleString("en-US")} mi</span>}
                      </td>
                      <td className="px-2 py-2">
                        {optionTerms(o)}
                        {o.cash_price_cents && <span className="block text-xs text-gray-500">Cash {money(o.cash_price_cents)}</span>}
                      </td>
                      <td className="px-2 py-2"><Badge tone={statusTone[st]}>{st.replace("_", " ")}</Badge></td>
                      <td className="px-2 py-2">{st === "selected" ? `Picked ${prettyDateTime(o.selected_at)}` : prettyDateTime(o.expires_at)}</td>
                      <td className="px-2 py-2 text-right">
                        {(o.status === "draft" || st === "offered") && (
                          <form action={removeOption}>
                            <input type="hidden" name="customer_id" value={customer.id} />
                            <input type="hidden" name="option_id" value={o.id} />
                            <button className="text-xs font-bold text-blackline-red underline">
                              {o.status === "draft" ? "Delete" : "Withdraw"}
                            </button>
                          </form>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </Table>
            </div>
          )}

          <p className="mb-3 text-sm font-bold">Add an option (saved as a draft until you click Send)</p>
          <UploadForm
            getUploadUrl={createOptionPhotoUpload}
            extraUploadArg={customer.id}
            onSubmit={addVehicleOption}
            fileLabel="Photo (optional)"
            accept="image/*"
            submitLabel="Save draft option"
            fileOptional
          >
            <input type="hidden" name="customer_id" value={customer.id} />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Label text="Year"><input name="vehicle_year" inputMode="numeric" className={inputClass} /></Label>
              <Label text="Make *"><input name="vehicle_make" required className={inputClass} /></Label>
              <Label text="Model *"><input name="vehicle_model" required className={inputClass} /></Label>
              <Label text="Trim"><input name="vehicle_trim" className={inputClass} /></Label>
              <Label text="Mileage"><input name="mileage" inputMode="numeric" className={inputClass} /></Label>
              <Label text="Payment $ *"><input name="payment" inputMode="decimal" required placeholder="600" className={inputClass} /></Label>
              <Label text="Frequency">
                <select name="frequency" defaultValue="monthly" className={inputClass}>
                  <option value="monthly">monthly</option>
                  <option value="biweekly">biweekly</option>
                  <option value="weekly">weekly</option>
                </select>
              </Label>
              <Label text="# of payments"><input name="term_payments" inputMode="numeric" placeholder="24" className={inputClass} /></Label>
              <Label text="Due at delivery $"><input name="down_payment" inputMode="decimal" placeholder="0" className={inputClass} /></Label>
              <Label text="Cash price $"><input name="cash_price" inputMode="decimal" className={inputClass} /></Label>
              <div className="sm:col-span-2">
                <Label text="Care Plan note">
                  <input name="care_plan_note" placeholder="Essential included in payment" className={inputClass} />
                </Label>
              </div>
              <div className="sm:col-span-2 lg:col-span-4">
                <Label text="Description (shown to the customer)">
                  <textarea name="description" rows={3} className={inputClass} />
                </Label>
              </div>
            </div>
          </UploadForm>
        </Card>
      )}
    </div>
  );
}
