import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Customer Portal",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function PortalLayout({ children }: { children: ReactNode }) {
  return children;
}
