"use server";

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/portal/session";
import { adminClient } from "@/lib/portal/supabase";

const allowed = ["new", "contacted", "qualified", "applied", "won", "lost"];

export async function updateLead(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("lead_id") ?? "");
  const status = String(formData.get("status") ?? "new");
  const notes = String(formData.get("notes") ?? "").trim().slice(0, 4000);
  const back = String(formData.get("back") ?? "open");
  if (!allowed.includes(status)) redirect(`/portal/admin/leads?status=${back}&error=Pick%20a%20status.`);

  const db = adminClient();
  const { data: current } = await db.from("leads").select("contacted_at").eq("id", id).maybeSingle();
  const update: Record<string, unknown> = { status, notes: notes || null };
  // First time a lead moves past "new", record when we reached out.
  if (status !== "new" && current && !current.contacted_at) update.contacted_at = new Date().toISOString();

  const { error } = await db.from("leads").update(update).eq("id", id);
  if (error) redirect(`/portal/admin/leads?status=${back}&error=${encodeURIComponent(error.message)}`);
  redirect(`/portal/admin/leads?status=${back}&ok=Lead%20saved.`);
}
