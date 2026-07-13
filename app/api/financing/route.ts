import { handleFormSubmission } from "@/lib/api";
import { financingSchema } from "@/lib/validation";

export async function POST(request: Request) {
  return handleFormSubmission(request, financingSchema, "Financing");
}
