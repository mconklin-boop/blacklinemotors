import { NextResponse } from "next/server";
import { forwardLead } from "@/lib/leads";
import { site } from "@/lib/site";
import { prequalSchema } from "@/lib/validation";
import { portalEnabled } from "@/lib/portal/config";
import { createApplicantAccount } from "@/lib/portal/applications";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const es = body?.language === "es";
  const result = prequalSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      {
        ok: false,
        message: es
          ? "Revise los campos marcados e intente de nuevo."
          : "Please review the highlighted fields and try again.",
        errors: result.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }
  const d = result.data;

  const saved = await forwardLead("RTO Pre-Qualification", d as Record<string, unknown>, request);

  // Open their portal so they can upload documents and track the decision.
  let portal = false;
  if (portalEnabled()) {
    const url = new URL(request.url);
    const host = request.headers.get("x-forwarded-host") ?? url.host;
    const proto = request.headers.get("x-forwarded-proto") ?? url.protocol.replace(":", "");
    portal = await createApplicantAccount({
      name: d.name,
      email: d.email,
      phone: d.phone,
      language: d.language,
      baseUrl: `${proto}://${host}`,
      application: {
        monthlyIncome: d.monthlyIncome,
        timeAtJob: d.timeAtJob,
        timeAtAddress: d.timeAtAddress,
        vehicleWanted: d.vehicleWanted,
        preferredModels: d.preferredModels,
        mustHaves: d.mustHaves,
        budget: d.budget,
      },
    }).catch(() => false);
  }

  if (!saved && !portal) {
    return NextResponse.json(
      {
        ok: false,
        message: es
          ? `No pudimos enviar su información en línea. Por favor llame o envíenos un mensaje al ${site.phoneDisplay}.`
          : `We couldn't send your info online right now. Please call or text us at ${site.phoneDisplay}.`,
      },
      { status: 503 },
    );
  }

  return NextResponse.json({
    ok: true,
    message: portal
      ? es
        ? `¡Gracias! Le enviamos un correo a ${d.email} con un enlace para crear su contraseña. En su portal puede subir sus documentos, ver su decisión de aprobación y sus opciones de vehículo. ¿No lo ve? Revise su carpeta de spam o llame al ${site.phoneDisplay}.`
        : `Thanks! We emailed ${d.email} a link to create your password. In your portal you'll upload your documents, see your approval decision and view your vehicle options. Don't see it? Check spam, or call or text ${site.phoneDisplay}.`
      : es
        ? `¡Gracias! Recibimos su información. Nos comunicaremos con usted pronto. Si prefiere, llame o envíe un mensaje al ${site.phoneDisplay}.`
        : `Thanks! Your info was received. We'll reach out soon. Want to talk now? Call or text ${site.phoneDisplay}.`,
  });
}
