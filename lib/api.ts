import { NextResponse } from "next/server";
import type { ZodSchema } from "zod";

export async function handleFormSubmission(request: Request, schema: ZodSchema, label: string) {
  const body = await request.json().catch(() => null);
  const result = schema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      {
        ok: false,
        message: "Please review the highlighted fields and try again.",
        errors: result.error.flatten().fieldErrors
      },
      { status: 400 }
    );
  }

  if (process.env.NODE_ENV === "development") {
    console.info(`[Blackline Motors] ${label} submission`, result.data);
  }

  // TODO: Save validated submissions to Supabase and send notification email after production integrations are configured.
  return NextResponse.json({ ok: true, message: "Thanks. Blackline Motors received your submission." });
}
