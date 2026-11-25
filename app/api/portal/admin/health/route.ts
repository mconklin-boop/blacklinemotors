import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/portal/api-auth";
import { mailerEnabled } from "@/lib/mailer";

export const dynamic = "force-dynamic";

// Admin-only: confirms each outside service key works (never returns the keys).
export async function GET() {
  if (!(await isAdminRequest())) return NextResponse.json({ error: "Sign in as admin first." }, { status: 401 });

  async function anthropic() {
    if (!process.env.ANTHROPIC_API_KEY) return "missing";
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || "claude-sonnet-5-5",
        max_tokens: 5,
        messages: [{ role: "user", content: "Reply OK" }],
      }),
    });
    return r.ok ? "ok" : `error ${r.status}: ${(await r.text()).slice(0, 160)}`;
  }

  async function pandadoc() {
    if (!process.env.PANDADOC_API_KEY) return "missing";
    const id = process.env.PANDADOC_TEMPLATE_ID || "7CV3gqsyavTfuyyF2cESYm";
    const r = await fetch(`https://api.pandadoc.com/public/v1/templates/${id}/details`, {
      headers: { Authorization: `API-Key ${process.env.PANDADOC_API_KEY}` },
    });
    if (!r.ok) return `error ${r.status}: ${(await r.text()).slice(0, 160)}`;
    const j = (await r.json()) as { name?: string };
    return `ok (template: ${j.name ?? "found"})`;
  }

  const [a, p] = await Promise.all([anthropic().catch((e) => `error: ${e}`), pandadoc().catch((e) => `error: ${e}`)]);
  return NextResponse.json({ anthropic: a, pandadoc: p, email: mailerEnabled() ? "ok" : "missing" });
}
