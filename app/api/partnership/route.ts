import { handleFormSubmission } from "@/lib/api";
import { partnershipSchema } from "@/lib/validation";

export async function POST(request: Request) {
  return handleFormSubmission(request, partnershipSchema, "Partnership");
}
