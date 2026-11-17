import type { Metadata } from "next";
import { RtoContent } from "@/components/rto/RtoContent";

export const metadata: Metadata = {
  title: "Rent-to-Own Cars & SUVs in Aurora, CO",
  description:
    "Rent-to-own available. Flexible payments. Ask for details. Reliable clean-title cars and SUVs inspected by a master mechanic. Get pre-qualified in about 2 minutes.",
  alternates: {
    canonical: "/rent-to-own",
    languages: { "en-US": "/rent-to-own", "es-US": "/es/rent-to-own" },
  },
};

export default function RentToOwnPage() {
  return <RtoContent lang="en" />;
}
