import { handleFormSubmission } from "@/lib/api";
import { site } from "@/lib/site";
import { prequalSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const clone = request.clone();
  const body = (await clone.json().catch(() => null)) as
    | { language?: string }
    | null;
  const es = body?.language === "es";

  return handleFormSubmission(request, prequalSchema, "RTO Pre-Qualification", {
    success: es
      ? `¡Gracias! Recibimos su información. Nos comunicaremos con usted pronto, normalmente en menos de 1 hora durante el día. Si prefiere, llame o envíe un mensaje al ${site.phoneDisplay}.`
      : `Thanks! Your info was received. We'll reach out soon, usually within 1 hour during the day. Want to talk now? Call or text ${site.phoneDisplay}.`,
    failure: es
      ? `No pudimos enviar su información en línea. Por favor llame o envíenos un mensaje al ${site.phoneDisplay}.`
      : `We couldn't send your info online right now. Please call or text us at ${site.phoneDisplay}.`,
  });
}
