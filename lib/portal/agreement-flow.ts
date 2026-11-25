import { adminClient } from "./supabase";
import { loadDocuments } from "./data";
import { createDraft, pandadocEnabled } from "./pandadoc";
import type { Customer, VehicleOption } from "./types";

// Called right after a customer picks a vehicle: starts the PandaDoc packet as a draft.
export async function startAgreementDraft(optionId: string) {
  if (!pandadocEnabled()) return;
  const db = adminClient();
  const { data: o } = await db.from("vehicle_options").select("*").eq("id", optionId).maybeSingle();
  const option = o as VehicleOption | null;
  if (!option || option.pandadoc_document_id) return;
  const { data: c } = await db.from("customers").select("*").eq("id", option.customer_id).maybeSingle();
  const customer = c as Customer | null;
  if (!customer) return;
  try {
    const docs = await loadDocuments(customer.id);
    const id = await createDraft(customer, option, docs);
    await db.from("vehicle_options").update({ pandadoc_document_id: id, pandadoc_status: "draft" }).eq("id", optionId);
  } catch (err) {
    await db
      .from("vehicle_options")
      .update({ pandadoc_status: `error: ${err instanceof Error ? err.message.slice(0, 200) : "unknown"}` })
      .eq("id", optionId);
  }
}

export async function nextAgreementNumber() {
  const { data } = await adminClient().from("agreements").select("agreement_number");
  const nums = (data ?? [])
    .map((r: { agreement_number: string }) => Number(r.agreement_number.match(/(\d+)\s*$/)?.[1] ?? 0))
    .filter(Number.isFinite);
  return `BLM-RTO-${String(Math.max(0, ...nums) + 1).padStart(4, "0")}`;
}
