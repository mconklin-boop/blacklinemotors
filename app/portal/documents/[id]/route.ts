import { NextResponse } from "next/server";
import { getUser } from "@/lib/portal/session";
import { isAdminEmail } from "@/lib/portal/config";
import { adminClient } from "@/lib/portal/supabase";
import { signedFileUrl } from "@/lib/portal/data";

// Sends the signed-in customer (or an admin) to a 5-minute download link.
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const user = await getUser();
  if (!user) return NextResponse.redirect(new URL("/portal/login", request.url));

  const { data: doc } = await adminClient()
    .from("documents")
    .select("customer_id, storage_path, visible_to_customer")
    .eq("id", id)
    .maybeSingle();

  const admin = isAdminEmail(user.email);
  const allowed =
    doc && (admin || (doc.customer_id === user.id && doc.visible_to_customer));
  if (!allowed) return new NextResponse("Not found", { status: 404 });

  const url = await signedFileUrl(doc.storage_path);
  if (!url) return new NextResponse("File unavailable", { status: 503 });
  return NextResponse.redirect(url);
}
