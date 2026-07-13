import { handleFormSubmission } from "@/lib/api";
import { buyerInquirySchema } from "@/lib/validation";

export async function POST(request: Request) {
  return handleFormSubmission(request, buyerInquirySchema, "Buyer inquiry");
}
