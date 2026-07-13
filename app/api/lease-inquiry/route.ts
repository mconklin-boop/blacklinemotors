import { handleFormSubmission } from "@/lib/api";
import { leaseInquirySchema } from "@/lib/validation";

export async function POST(request: Request) {
  return handleFormSubmission(request, leaseInquirySchema, "Lease inquiry");
}
