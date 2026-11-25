import Link from "next/link";
import { AdminShell } from "@/components/portal/AdminShell";
import { Badge, Card, Notice, Table } from "@/components/portal/ui";
import { requireAdmin } from "@/lib/portal/session";
import { adminClient } from "@/lib/portal/supabase";
import { daysLeftToSubmit, effectiveStatus, optionName, prettyDateTime } from "@/lib/portal/applications";
import type { Customer, VehicleOption } from "@/lib/portal/types";

const groups = [
  { stage: "submitted", title: "Ready to review" },
  { stage: "approved", title: "Approved" },
  { stage: "applicant", title: "Not submitted yet" },
  { stage: "declined", title: "Declined" },
] as const;

export default async function ApplicationsPage() {
  await requireAdmin();
  const db = adminClient();
  const [{ data: c }, { data: o }, { data: d }] = await Promise.all([
    db.from("customers").select("*").neq("stage", "customer").order("created_at", { ascending: false }),
    db.from("vehicle_options").select("*"),
    db.from("documents").select("customer_id").not("kind", "is", null),
  ]);
  const customers = (c ?? []) as Customer[];
  const options = (o ?? []) as VehicleOption[];
  const docCount = new Map<string, number>();
  for (const row of (d ?? []) as { customer_id: string }[]) {
    docCount.set(row.customer_id, (docCount.get(row.customer_id) ?? 0) + 1);
  }

  function optionSummary(id: string) {
    const mine = options.filter((x) => x.customer_id === id);
    const picked = mine.find((x) => x.status === "selected");
    if (picked) return <Badge tone="good">Picked {optionName(picked)}</Badge>;
    const live = mine.filter((x) => effectiveStatus(x) === "offered");
    if (live.length) return <Badge tone="alert">{live.length} offered</Badge>;
    if (mine.some((x) => x.status === "draft")) return <Badge tone="warn">drafts not sent</Badge>;
    if (mine.some((x) => effectiveStatus(x) === "expired")) return <Badge>expired, send new</Badge>;
    return <Badge tone="warn">needs options</Badge>;
  }

  return (
    <AdminShell title="Applications">
      {customers.length === 0 && <Notice>No applications yet. They show up here when someone pre-qualifies.</Notice>}
      {groups.map(({ stage, title }) => {
        const rows = customers.filter((x) => x.stage === stage);
        if (!rows.length) return null;
        return (
          <Card key={stage} title={`${title} (${rows.length})`}>
            <Table head={["Applicant", "Phone", "Applied", "Docs", stage === "approved" ? "Options" : stage === "applicant" ? "Deletes in" : "Submitted"]}>
              {rows.map((x) => (
                <tr key={x.id}>
                  <td className="px-2 py-2">
                    <Link href={`/portal/admin/customers/${x.id}#application`} className="font-semibold underline">
                      {x.full_name}
                    </Link>
                    <span className="block text-xs text-gray-500">{x.email}</span>
                  </td>
                  <td className="px-2 py-2">{x.phone ? <a href={`tel:${x.phone}`} className="underline">{x.phone}</a> : "—"}</td>
                  <td className="px-2 py-2">{prettyDateTime(x.created_at)}</td>
                  <td className="px-2 py-2">{docCount.get(x.id) ?? 0}</td>
                  <td className="px-2 py-2">
                    {stage === "approved"
                      ? optionSummary(x.id)
                      : stage === "applicant"
                        ? x.submitted_at
                          ? "sent back for info"
                          : `${daysLeftToSubmit(x)} days`
                        : prettyDateTime(x.submitted_at)}
                  </td>
                </tr>
              ))}
            </Table>
          </Card>
        );
      })}
    </AdminShell>
  );
}
