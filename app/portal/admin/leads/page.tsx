import Link from "next/link";
import { AdminShell } from "@/components/portal/AdminShell";
import { Badge, Card, Flash, Notice } from "@/components/portal/ui";
import { SubmitButton } from "@/components/portal/SubmitButton";
import { requireAdmin } from "@/lib/portal/session";
import { adminClient } from "@/lib/portal/supabase";
import { leadSummary } from "@/lib/leads";
import { mailerEnabled } from "@/lib/mailer";
import { updateLead } from "./actions";

type Lead = {
  id: string;
  created_at: string;
  form: string;
  status: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  fields: Record<string, unknown>;
  notes: string | null;
  alert_sent: boolean;
  contacted_at: string | null;
};

const statuses = ["new", "contacted", "qualified", "applied", "won", "lost"];
const tone = (s: string) =>
  s === "new" ? "alert" : s === "won" ? "good" : s === "lost" ? "default" : ("warn" as const);

function when(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    timeZone: "America/Denver",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function minutesBetween(a: string, b: string) {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 60000);
}

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  await requireAdmin();
  const filter = typeof params.status === "string" ? params.status : "open";
  let query = adminClient().from("leads").select("*").order("created_at", { ascending: false }).limit(200);
  if (filter === "open") query = query.not("status", "in", "(won,lost)");
  else if (filter !== "all") query = query.eq("status", filter);
  const { data } = await query;
  const leads = (data ?? []) as Lead[];

  return (
    <AdminShell title="Website leads">
      <Flash params={params} />
      {!mailerEnabled() && (
        <Notice tone="warning">
          Email alerts are off until SMTP_USER and SMTP_PASS are set in Vercel. Leads are still saved here.
        </Notice>
      )}
      <nav className="flex flex-wrap gap-2 text-sm">
        {["open", "new", "contacted", "qualified", "applied", "won", "lost", "all"].map((s) => (
          <Link
            key={s}
            href={`/portal/admin/leads?status=${s}`}
            className={`rounded-full border px-3 py-1 font-semibold ${filter === s ? "border-blackline-black bg-blackline-black text-white" : "border-gray-300 bg-white"}`}
          >
            {s}
          </Link>
        ))}
      </nav>

      {leads.length === 0 && <Notice>No leads in this view yet.</Notice>}

      {leads.map((lead) => (
        <Card
          key={lead.id}
          title={`${lead.name ?? "No name"} · ${lead.form}`}
          aside={
            <span className="flex items-center gap-2 text-sm text-gray-500">
              {when(lead.created_at)} <Badge tone={tone(lead.status)}>{lead.status}</Badge>
            </span>
          }
        >
          <div className="grid gap-4 md:grid-cols-[1fr,320px]">
            <div className="space-y-3 text-sm">
              <div className="flex flex-wrap gap-2">
                {lead.phone && (
                  <>
                    <a href={`tel:${lead.phone.replace(/[^\d+]/g, "")}`} className="rounded-md bg-blackline-red px-3 py-1.5 font-bold text-white">
                      Call {lead.phone}
                    </a>
                    <a href={`sms:${lead.phone.replace(/[^\d+]/g, "")}`} className="rounded-md border border-gray-300 px-3 py-1.5 font-bold">
                      Text
                    </a>
                  </>
                )}
                {lead.email && (
                  <a href={`mailto:${lead.email}`} className="rounded-md border border-gray-300 px-3 py-1.5 font-bold">
                    Email
                  </a>
                )}
              </div>
              <pre className="whitespace-pre-wrap font-body text-gray-700">{leadSummary(lead.fields)}</pre>
              <p className="text-xs text-gray-500">
                {lead.alert_sent ? "Email alert sent" : "No email alert"}
                {lead.contacted_at &&
                  ` · First contact ${when(lead.contacted_at)} (${minutesBetween(lead.created_at, lead.contacted_at)} min after it came in)`}
              </p>
            </div>
            <form action={updateLead} className="space-y-2">
              <input type="hidden" name="lead_id" value={lead.id} />
              <input type="hidden" name="back" value={filter} />
              <select name="status" defaultValue={lead.status} className="w-full rounded-md border border-gray-300 px-2 py-2 text-sm">
                {statuses.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
              <textarea
                name="notes"
                rows={3}
                defaultValue={lead.notes ?? ""}
                placeholder="Notes (called, left voicemail, needs pay stubs…)"
                className="w-full rounded-md border border-gray-300 px-2 py-2 text-sm"
              />
              <SubmitButton pendingText="Saving…" className="w-full">Save</SubmitButton>
            </form>
          </div>
        </Card>
      ))}
    </AdminShell>
  );
}
