import { handleFormSubmission } from "@/lib/api";
import { requestVehicleSchema } from "@/lib/validation";

export async function POST(request: Request) {
  return handleFormSubmission(request, requestVehicleSchema, "Request vehicle");
}
