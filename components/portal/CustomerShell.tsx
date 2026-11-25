import type { ReactNode } from "react";
import { PortalFrame } from "./ui";
import { PortalNav } from "./PortalNav";
import { SubmitButton } from "./SubmitButton";
import { adminClient } from "@/lib/portal/supabase";
import { signOut } from "@/app/portal/actions";
import type { Customer } from "@/lib/portal/types";

export async function CustomerShell({
  customer,
  title,
  children,
}: {
  customer: Customer | null;
  title: string;
  children: ReactNode;
}) {
  let unread = 0;
  if (customer) {
    const { count } = await adminClient()
      .from("messages")
      .select("id", { count: "exact", head: true })
      .eq("customer_id", customer.id)
      .eq("sender", "blackline")
      .eq("read_by_customer", false);
    unread = count ?? 0;
  }
  return (
    <PortalFrame
      title={title}
      eyebrow={customer ? `Welcome, ${customer.full_name.split(" ")[0]}` : "Customer portal"}
      nav={<PortalNav unread={unread} />}
      actions={
        <form action={signOut}>
          <SubmitButton variant="secondary" pendingText="Signing out…">
            Sign out
          </SubmitButton>
        </form>
      }
    >
      {children}
    </PortalFrame>
  );
}
