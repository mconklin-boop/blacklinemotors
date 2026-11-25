import type { ReactNode } from "react";
import { CheckCircle2, Circle, Clock } from "lucide-react";
import { Badge, Card, Label, Notice, inputClass } from "./ui";
import { SubmitButton } from "./SubmitButton";
import { UploadForm } from "./UploadForm";
import { loadDocuments, signedFileUrl } from "@/lib/portal/data";
import { money } from "@/lib/portal/account";
import {
  DOC_KINDS,
  PURGE_AFTER_DAYS,
  applicationChecklist,
  daysLeftToSubmit,
  effectiveStatus,
  isLive,
  loadOptions,
  optionName,
  optionTerms,
  prettyDateTime,
} from "@/lib/portal/applications";
import {
  addApplicationDocument,
  createApplicationUpload,
  removeApplicationDocument,
  saveApplicationDetails,
  selectOption,
  submitApplication,
} from "@/app/portal/apply-actions";
import { site } from "@/lib/site";
import type { Customer } from "@/lib/portal/types";

function Step({ done, children }: { done: boolean; children: ReactNode }) {
  return (
    <li className="flex items-center gap-2">
      {done ? <CheckCircle2 size={18} className="text-green-700" /> : <Circle size={18} className="text-gray-400" />}
      <span className={done ? "text-gray-500 line-through" : "font-semibold"}>{children}</span>
    </li>
  );
}

export async function ApplicationView({ customer }: { customer: Customer }) {
  const docs = (await loadDocuments(customer.id)).filter((d) => d.kind);
  const app = customer.application ?? {};

  if (customer.stage === "applicant") {
    const check = applicationChecklist(app, docs);
    const ready = Object.values(check).every(Boolean);
    const daysLeft = daysLeftToSubmit(customer);
    const refs = app.references ?? [];
    return (
      <>
        <Notice tone={daysLeft <= 7 ? "warning" : "info"}>
          Finish your application to get an approval decision. Applications that aren&apos;t submitted within{" "}
          {PURGE_AFTER_DAYS} days are deleted automatically.{" "}
          <strong>
            {daysLeft} {daysLeft === 1 ? "day" : "days"} left.
          </strong>
        </Notice>

        <Card title="Your checklist">
          <ul className="space-y-2 text-sm">
            <Step done={check.license}>Upload your driver&apos;s license</Step>
            <Step done={check.income}>Upload proof of income (two recent pay stubs)</Step>
            <Step done={check.residence}>Upload proof of residence</Step>
            <Step done={check.details}>Add your employer and two references</Step>
          </ul>
          <form action={submitApplication} className="mt-5">
            <SubmitButton pendingText="Submitting…" disabled={!ready}>
              Submit my application
            </SubmitButton>
            {!ready && <p className="mt-2 text-xs text-gray-500">Finish every step to submit.</p>}
          </form>
        </Card>

        <div className="grid gap-6 lg:grid-cols-3">
          {DOC_KINDS.map((def) => {
            const mine = docs.filter((d) => d.kind === def.kind);
            return (
              <Card key={def.kind} title={def.title} aside={mine.length > 0 ? <Badge tone="good">uploaded</Badge> : undefined}>
                <p className="mb-4 text-sm text-gray-600">{def.help}</p>
                {mine.length > 0 && (
                  <ul className="mb-4 divide-y divide-gray-100 border-y border-gray-200 text-sm">
                    {mine.map((d) => (
                      <li key={d.id} className="flex items-center justify-between gap-2 py-2">
                        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
                        <a href={`/portal/documents/${d.id}`} className="truncate underline">
                          {d.storage_path.split("/").pop()?.replace(/^[a-z]+-\d+-/, "")}
                        </a>
                        <form action={removeApplicationDocument}>
                          <input type="hidden" name="document_id" value={d.id} />
                          <button className="text-xs font-bold text-blackline-red underline">Remove</button>
                        </form>
                      </li>
                    ))}
                  </ul>
                )}
                <UploadForm
                  getUploadUrl={createApplicationUpload}
                  extraUploadArg={def.kind}
                  onSubmit={addApplicationDocument}
                  fileLabel={mine.length ? "Add another file" : "Photo or PDF"}
                  submitLabel="Upload"
                >
                  <input type="hidden" name="kind" value={def.kind} />
                </UploadForm>
              </Card>
            );
          })}
        </div>

        <Card title="Employment and references">
          <form action={saveApplicationDetails} className="grid gap-4 sm:grid-cols-3">
            <Label text="Employer *">
              <input name="employer" required defaultValue={app.employer ?? ""} className={inputClass} />
            </Label>
            <Label text="Employer phone">
              <input name="employerPhone" type="tel" defaultValue={app.employerPhone ?? ""} className={inputClass} />
            </Label>
            <Label text="Job title">
              <input name="jobTitle" defaultValue={app.jobTitle ?? ""} className={inputClass} />
            </Label>
            {[1, 2].map((n) => {
              const r = refs[n - 1];
              return (
                <div key={n} className="contents">
                  <Label text={`Reference ${n} name *`}>
                    <input name={`ref${n}_name`} required defaultValue={r?.name ?? ""} className={inputClass} />
                  </Label>
                  <Label text={`Reference ${n} phone *`}>
                    <input name={`ref${n}_phone`} type="tel" required defaultValue={r?.phone ?? ""} className={inputClass} />
                  </Label>
                  <Label text="Relationship">
                    <input name={`ref${n}_relationship`} placeholder="Friend, coworker…" defaultValue={r?.relationship ?? ""} className={inputClass} />
                  </Label>
                </div>
              );
            })}
            <div className="sm:col-span-3">
              <SubmitButton pendingText="Saving…">Save</SubmitButton>
            </div>
          </form>
        </Card>
      </>
    );
  }

  if (customer.stage === "submitted") {
    return (
      <Card title="Application submitted">
        <p className="flex items-center gap-2 text-sm text-gray-700">
          <Clock size={18} className="text-blackline-red" />
          Submitted {prettyDateTime(customer.submitted_at)}. We&apos;re reviewing your documents and will post a
          decision here, usually within 1 business day. We&apos;ll email you too.
        </p>
        <p className="mt-3 text-sm text-gray-600">
          Questions? Use Messages or call or text {site.phoneDisplay}.
        </p>
      </Card>
    );
  }

  if (customer.stage === "declined") {
    return (
      <Card title="Application decision">
        <Notice tone="warning">
          We&apos;re not able to approve your application right now.
          {customer.decision_note && (
            <>
              <br />
              <span className="mt-2 block">{customer.decision_note}</span>
            </>
          )}
        </Notice>
        <p className="mt-3 text-sm text-gray-600">
          If something has changed, send us a message or call or text {site.phoneDisplay}.
        </p>
      </Card>
    );
  }

  // Approved
  const options = await loadOptions(customer.id);
  const selected = options.find((o) => o.status === "selected");
  const live = options.filter(isLive);
  const photos = new Map<string, string>();
  await Promise.all(
    [...live, ...(selected ? [selected] : [])].map(async (o) => {
      if (!o.photo_path) return;
      const url = await signedFileUrl(o.photo_path, 3600);
      if (url) photos.set(o.id, url);
    }),
  );

  return (
    <>
      <Notice tone="success">
        <strong>You&apos;re approved!</strong>{" "}
        {customer.decision_note ? customer.decision_note : "Final terms are set in your written agreement."}
      </Notice>

      {selected ? (
        <Card title="Your vehicle">
          {photos.get(selected.id) && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photos.get(selected.id)} alt={optionName(selected)} className="mb-4 max-h-72 w-full rounded object-cover" />
          )}
          <p className="text-xl font-bold">{optionName(selected)}</p>
          <p className="mt-1 text-sm text-gray-700">{optionTerms(selected)}</p>
          <p className="mt-4 text-sm text-gray-600">
            You picked this vehicle on {prettyDateTime(selected.selected_at)}. We&apos;re securing it now and will
            reach out about inspection, your agreement and delivery.
          </p>
        </Card>
      ) : live.length > 0 ? (
        <>
          <Card title="Pick your vehicle">
            <p className="text-sm text-gray-700">
              Choose one option below. Each option is held for 24 hours. After that it expires and the vehicle may
              go to someone else.
            </p>
          </Card>
          <div className="grid gap-6 md:grid-cols-2">
            {live.map((o) => (
              <Card key={o.id}>
                {photos.get(o.id) && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photos.get(o.id)} alt={optionName(o)} className="mb-4 h-56 w-full rounded object-cover" />
                )}
                <p className="text-xl font-bold">{optionName(o)}</p>
                {o.mileage !== null && (
                  <p className="text-sm text-gray-600">{o.mileage.toLocaleString("en-US")} miles</p>
                )}
                <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <dt className="text-xs font-bold uppercase tracking-wide text-gray-500">Payment</dt>
                    <dd className="text-lg font-bold">{money(o.payment_cents)}<span className="text-sm font-normal"> / {o.frequency === "monthly" ? "mo" : o.frequency === "weekly" ? "wk" : "2 wks"}</span></dd>
                  </div>
                  {o.term_payments && (
                    <div>
                      <dt className="text-xs font-bold uppercase tracking-wide text-gray-500">Payments</dt>
                      <dd className="text-lg font-bold">{o.term_payments}</dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-xs font-bold uppercase tracking-wide text-gray-500">Due at delivery</dt>
                    <dd className="text-lg font-bold">{money(o.down_payment_cents)}</dd>
                  </div>
                  {o.cash_price_cents && (
                    <div>
                      <dt className="text-xs font-bold uppercase tracking-wide text-gray-500">Cash price</dt>
                      <dd className="text-lg font-bold">{money(o.cash_price_cents)}</dd>
                    </div>
                  )}
                </dl>
                {o.care_plan_note && <p className="mt-3 text-sm text-gray-600">Care Plan: {o.care_plan_note}</p>}
                {o.description && <p className="mt-3 whitespace-pre-line text-sm text-gray-700">{o.description}</p>}
                <p className="mt-4 flex items-center gap-1.5 text-sm font-semibold text-blackline-red">
                  <Clock size={16} /> Expires {prettyDateTime(o.expires_at)}
                </p>
                <form action={selectOption} className="mt-4">
                  <input type="hidden" name="option_id" value={o.id} />
                  <SubmitButton pendingText="Saving your pick…">Choose this vehicle</SubmitButton>
                </form>
              </Card>
            ))}
          </div>
          <p className="text-xs text-gray-500">
            Terms shown are estimates for your review. Final terms, costs and conditions are in your written agreement,
            which you&apos;ll review before you sign.
          </p>
        </>
      ) : options.some((o) => effectiveStatus(o) === "expired") ? (
        <Card title="Your options expired">
          <p className="text-sm text-gray-700">
            The vehicle options we sent have expired. Send us a message or call or text {site.phoneDisplay} and
            we&apos;ll send you new ones.
          </p>
        </Card>
      ) : (
        <Card title="Finding your vehicle">
          <p className="text-sm text-gray-700">
            We&apos;re finding vehicle options that fit you. They&apos;ll show up here and we&apos;ll email you when
            they&apos;re ready. You&apos;ll have 24 hours to pick one.
          </p>
        </Card>
      )}
    </>
  );
}
