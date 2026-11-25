import { getUser } from "./session";
import { isAdminEmail } from "./config";

// For JSON endpoints used from an admin's signed-in browser (the vehicle search task).
export async function isAdminRequest() {
  const user = await getUser();
  return Boolean(user && isAdminEmail(user.email));
}
