import { adminClient } from "./supabase";
import { summarize, type AccountSummary } from "./account";
import type {
  Agreement,
  Fee,
  InsurancePolicy,
  Message,
  Payment,
  PortalDocument,
} from "./types";

export type AgreementAccount = {
  agreement: Agreement;
  payments: Payment[];
  fees: Fee[];
  summary: AccountSummary;
};

export async function loadAgreements(customerId: string): Promise<AgreementAccount[]> {
  const db = adminClient();
  const { data: agreements } = await db
    .from("agreements")
    .select("*")
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });
  const list = (agreements ?? []) as Agreement[];
  if (!list.length) return [];
  const ids = list.map((a) => a.id);
  const [{ data: payments }, { data: fees }] = await Promise.all([
    db.from("payments").select("*").in("agreement_id", ids).order("paid_on", { ascending: false }),
    db.from("fees").select("*").in("agreement_id", ids).order("assessed_on", { ascending: false }),
  ]);
  return list.map((agreement) => {
    const p = ((payments ?? []) as Payment[]).filter((x) => x.agreement_id === agreement.id);
    const f = ((fees ?? []) as Fee[]).filter((x) => x.agreement_id === agreement.id);
    return { agreement, payments: p, fees: f, summary: summarize(agreement, p, f) };
  });
}

// The agreement shown on the customer's dashboard: active first, else newest.
export function primaryAgreement(list: AgreementAccount[]) {
  return list.find((x) => x.agreement.status === "active") ?? list[0] ?? null;
}

export async function loadDocuments(customerId: string, includeHidden = false) {
  let query = adminClient()
    .from("documents")
    .select("*")
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });
  if (!includeHidden) query = query.eq("visible_to_customer", true);
  const { data } = await query;
  return (data ?? []) as PortalDocument[];
}

export async function loadInsurance(customerId: string) {
  const { data } = await adminClient()
    .from("insurance_policies")
    .select("*")
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });
  return (data ?? []) as InsurancePolicy[];
}

export async function loadMessages(customerId: string) {
  const { data } = await adminClient()
    .from("messages")
    .select("*")
    .eq("customer_id", customerId)
    .order("created_at", { ascending: true });
  return (data ?? []) as Message[];
}

export async function signedFileUrl(path: string, seconds = 300) {
  const { data } = await adminClient().storage.from("portal").createSignedUrl(path, seconds);
  return data?.signedUrl ?? null;
}
