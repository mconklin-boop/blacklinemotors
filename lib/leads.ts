// Sends a validated form submission to the Google Apps Script web app that
// writes it to the "Blackline Leads" Google Sheet and emails an alert.
// Configure in Vercel: LEADS_WEBHOOK_URL and LEADS_WEBHOOK_SECRET.

export async function forwardLead(
  form: string,
  fields: Record<string, unknown>,
  request: Request,
): Promise<boolean> {
  const url = process.env.LEADS_WEBHOOK_URL;
  const secret = process.env.LEADS_WEBHOOK_SECRET;
  if (!url || !secret) return false;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        secret,
        form,
        submittedAt: new Date().toISOString(),
        page: request.headers.get("referer") ?? "",
        fields,
      }),
      redirect: "follow",
      signal: controller.signal,
    });
    if (!response.ok) return false;
    const data = (await response.json().catch(() => null)) as
      | { ok?: boolean }
      | null;
    return data?.ok === true;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}
