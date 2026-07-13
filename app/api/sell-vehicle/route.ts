import { handleFormSubmission } from "@/lib/api";
import { sellVehicleSchema } from "@/lib/validation";

export async function POST(request: Request) {
  return handleFormSubmission(request, sellVehicleSchema, "Sell vehicle");
}
