import { NextResponse } from "next/server";
import { getUser } from "@/lib/portal/session";
import { isAdminEmail } from "@/lib/portal/config";
import { signedFileUrl } from "@/lib/portal/data";

// Admin-only: open any portal file (for example an uploaded insurance card).
export async function GET(request: Request) {
  const user = await getUser();
  if (!user || !isAdminEmail(user.email)) {
    return NextResponse.redirect(new URL("/portal/login", request.url));
  }
  const path = new URL(request.url).searchParams.get("path");
  if (!path || !path.startsWith("customers/")) return new NextResponse("Not found", { status: 404 });
  const url = await signedFileUrl(path);
  if (!url) return new NextResponse("File unavailable", { status: 503 });
  return NextResponse.redirect(url);
}
