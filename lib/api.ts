import { NextResponse } from "next/server";
import type { ZodSchema } from "zod";
import { forwardLead } from "@/lib/leads";
import { site } from "@/lib/site";

export async function handleFormSubmission(
  request: Request,
  schema: ZodSchema,
  label: string,
  messages: { success?: string; failure?: string } = {},
) {
  const body = await request.json().catch(() => null);
  const result = schema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      {
        ok: false,
        message: "Please review the highlighted fields and try again.",
        errors: result.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const delivered = await forwardLead(
    label,
    result.data as Record<string, unknown>,
    request,
  );

  // Only report success when the lead was actually saved.
  if (!delivered) {
    return NextResponse.json(
      {
        ok: false,
        message:
          messages.failure ??
          `We couldn't send your message online right now. Please call or text Mike at ${site.phoneDisplay}.`,
      },
      { status: 503 },
    );
  }

  return NextResponse.json({
    ok: true,
    message:
      messages.success ??
      "Thanks! Your message was received. Mike will be in touch soon.",
  });
}
