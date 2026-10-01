import { NextResponse } from "next/server";
import type { ZodSchema } from "zod";

export async function handleFormSubmission(
  request: Request,
  schema: ZodSchema,
  label: string,
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

  void label;
  // Do not report a delivered inquiry until lead storage and notifications are configured.
  return NextResponse.json(
    {
      ok: false,
      message:
        "Online inquiries are not connected yet. This design preview does not save or send submissions.",
    },
    { status: 503 },
  );
}
