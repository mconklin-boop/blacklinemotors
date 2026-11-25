import { NextResponse } from "next/server";
import { adminClient } from "@/lib/portal/supabase";
import { portalEnabled } from "@/lib/portal/config";
import { PURGE_AFTER_DAYS, WARN_AFTER_DAYS, adminAlertEmail } from "@/lib/portal/applications";
import { sendMail } from "@/lib/mailer";
import { site } from "@/lib/site";
import type { Customer } from "@/lib/portal/types";

export const dynamic = "force-dynamic";

// Runs daily (vercel.json). Only enforces the posted rules, so a stray request
// does nothing harmful. If CRON_SECRET is set in Vercel it is required.
//  1. Marks vehicle options past their 24-hour window as expired.
//  2. Warns applicants who haven't submitted, 7 days before deletion.
//  3. Deletes applicants who never submitted their documents within 30 days.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  if (!portalEnabled()) return NextResponse.json({ ok: false, reason: "portal off" });

  const db = adminClient();
  const now = Date.now();
  const iso = (days: number) => new Date(now - days * 86_400_000).toISOString();
  const base = site.url.replace(/\/$/, "");

  const { data: expired } = await db
    .from("vehicle_options")
    .update({ status: "expired" })
    .eq("status", "offered")
    .lt("expires_at", new Date(now).toISOString())
    .select("id");

  const { data: toWarn } = await db
    .from("customers")
    .select("*")
    .eq("stage", "applicant")
    .is("submitted_at", null)
    .is("purge_warned_at", null)
    .lt("created_at", iso(WARN_AFTER_DAYS))
    .gte("created_at", iso(PURGE_AFTER_DAYS));
  let warned = 0;
  for (const c of (toWarn ?? []) as Customer[]) {
    const es = c.language === "es";
    const sent = await sendMail({
      to: c.email,
      fromName: site.name,
      subject: es ? "Su solicitud se borrará en 7 días" : "Your application will be deleted in 7 days",
      text: es
        ? `Hola ${c.full_name.split(" ")[0]},\n\nTodavía no ha subido sus documentos. Si no envía su solicitud en los próximos 7 días, su cuenta se borrará automáticamente.\n\nTermine aquí: ${base}/portal\n¿Olvidó su contraseña? ${base}/portal/forgot-password\n\nBlackline Motors · ${site.phoneDisplay}`
        : `Hi ${c.full_name.split(" ")[0]},\n\nYour rent-to-own application still needs your documents. If it isn't submitted in the next 7 days, the account will be deleted automatically.\n\nFinish here: ${base}/portal\nForgot your password? ${base}/portal/forgot-password\n\nBlackline Motors · ${site.phoneDisplay}`,
    });
    await db.from("customers").update({ purge_warned_at: new Date().toISOString() }).eq("id", c.id);
    if (sent) warned++;
  }

  const { data: toPurge } = await db
    .from("customers")
    .select("id, full_name, email")
    .eq("stage", "applicant")
    .is("submitted_at", null)
    .lt("created_at", iso(PURGE_AFTER_DAYS));
  const purged: string[] = [];
  for (const c of (toPurge ?? []) as Pick<Customer, "id" | "full_name" | "email">[]) {
    const { data: files } = await db.storage.from("portal").list(`customers/${c.id}/application`, { limit: 100 });
    if (files?.length) {
      await db.storage.from("portal").remove(files.map((f) => `customers/${c.id}/application/${f.name}`));
    }
    // Deleting the login removes the customer row and everything tied to it.
    const { error } = await db.auth.admin.deleteUser(c.id);
    if (!error) purged.push(`${c.full_name} <${c.email}>`);
  }
  if (purged.length) {
    await sendMail({
      to: adminAlertEmail(),
      fromName: "Blackline Portal",
      subject: `Deleted ${purged.length} unfinished application${purged.length === 1 ? "" : "s"}`,
      text: `These applicants never submitted their documents within ${PURGE_AFTER_DAYS} days, so their accounts were deleted:\n\n${purged.join("\n")}\n\nTheir website lead records are still on the Leads page.`,
    });
  }

  return NextResponse.json({ ok: true, expired: expired?.length ?? 0, warned, purged: purged.length });
}
