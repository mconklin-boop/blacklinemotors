import { handleFormSubmission } from "@/lib/api";
import { contactSchema } from "@/lib/validation";

export async function POST(request: Request) {
  return handleFormSubmission(request, contactSchema, "Contact");
}
