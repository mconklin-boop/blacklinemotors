import { CustomerShell } from "@/components/portal/CustomerShell";
import { Badge, Card, Flash, Label, Notice, Table, inputClass } from "@/components/portal/ui";
import { UploadForm } from "@/components/portal/UploadForm";
import { requireCustomer } from "@/lib/portal/session";
import { loadInsurance } from "@/lib/portal/data";
import { prettyDate } from "@/lib/portal/account";
import { createInsuranceUpload, submitInsurance } from "../actions";

export default async function InsurancePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const { customer } = await requireCustomer();
  const policies = customer ? await loadInsurance(customer.id) : [];

  return (
    <CustomerShell customer={customer} title="Insurance">
      <Flash params={params} />
      <Notice>
        Your agreement requires full-coverage insurance for the whole term, with{" "}
        <strong>Blackline Motors LLC, 1500 N Grant St #7339, Denver, CO 80203</strong> listed as
        additional insured and loss payee. Upload your insurance card or declarations page each time
        your policy renews.
      </Notice>

      {customer && (
        <Card title="Upload proof of insurance">
          <UploadForm
            getUploadUrl={createInsuranceUpload}
            onSubmit={submitInsurance}
            fileLabel="Insurance card or declarations page (photo or PDF)"
            submitLabel="Submit insurance"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Label text="Insurance company">
                <input name="carrier" required className={inputClass} />
              </Label>
              <Label text="Policy number">
                <input name="policy_number" className={inputClass} />
              </Label>
              <Label text="Start date">
                <input name="effective_on" type="date" className={inputClass} />
              </Label>
              <Label text="Expiration date">
                <input name="expires_on" type="date" required className={inputClass} />
              </Label>
            </div>
          </UploadForm>
        </Card>
      )}

      <Card title="Submitted policies">
        {policies.length === 0 ? (
          <p className="text-sm text-gray-600">Nothing submitted yet.</p>
        ) : (
          <Table head={["Company", "Policy #", "Expires", "Status"]}>
            {policies.map((p) => (
              <tr key={p.id}>
                <td className="px-2 py-2 font-semibold">{p.carrier}</td>
                <td className="px-2 py-2">{p.policy_number ?? "—"}</td>
                <td className="px-2 py-2">{prettyDate(p.expires_on)}</td>
                <td className="px-2 py-2">
                  <Badge tone={p.status === "approved" ? "good" : p.status === "rejected" ? "alert" : "warn"}>
                    {p.status === "submitted" ? "under review" : p.status}
                  </Badge>
                  {p.review_note && <span className="block text-xs text-gray-500">{p.review_note}</span>}
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Card>
    </CustomerShell>
  );
}
