import { FileText } from "lucide-react";
import { CustomerShell } from "@/components/portal/CustomerShell";
import { Card, Notice } from "@/components/portal/ui";
import { requireCustomer } from "@/lib/portal/session";
import { loadDocuments } from "@/lib/portal/data";
import { prettyDate } from "@/lib/portal/account";
import { site } from "@/lib/site";

export default async function DocumentsPage() {
  const { customer } = await requireCustomer();
  const docs = customer ? await loadDocuments(customer.id) : [];

  return (
    <CustomerShell customer={customer} title="Documents">
      {docs.length === 0 ? (
        <Notice>
          Your signed agreement and other documents will appear here. Need a copy now? Email{" "}
          {site.accountsEmail}.
        </Notice>
      ) : (
        <Card>
          <ul className="divide-y divide-gray-100">
            {docs.map((d) => (
              <li key={d.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <span className="flex items-center gap-3">
                  <FileText size={20} className="text-blackline-red" />
                  <span>
                    <span className="block font-semibold">{d.title}</span>
                    <span className="text-xs text-gray-500">Added {prettyDate(d.created_at)}</span>
                  </span>
                </span>
                {/* Route handler returns a short-lived download link. */}
                {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
                <a
                  href={`/portal/documents/${d.id}`}
                  className="text-sm font-bold uppercase tracking-wide text-blackline-red underline"
                >
                  Open
                </a>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </CustomerShell>
  );
}
