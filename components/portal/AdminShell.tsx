import Link from "next/link";
import type { ReactNode } from "react";
import { PortalFrame } from "./ui";
import { SubmitButton } from "./SubmitButton";
import { signOut } from "@/app/portal/actions";

export function AdminShell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <PortalFrame
      eyebrow="Blackline admin"
      title={title}
      nav={
        <nav className="flex gap-4 border-b border-gray-300 pb-2 text-sm font-bold">
          <Link href="/portal/admin" className="hover:text-blackline-red">
            All customers
          </Link>
          <Link href="/portal/admin/applications" className="hover:text-blackline-red">
            Applications
          </Link>
          <Link href="/portal/admin/leads" className="hover:text-blackline-red">
            Website leads
          </Link>
        </nav>
      }
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
