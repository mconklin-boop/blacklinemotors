import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, BadgeDollarSign, Gift, Search } from "lucide-react";
import { RtoContent } from "@/components/rto/RtoContent";

export const metadata: Metadata = {
  title: { absolute: "Blackline Motors | Rent-to-Own Cars & SUVs in Aurora, CO" },
  description:
    "Rent-to-own available. Flexible payments. Ask for details. Reliable clean-title cars and SUVs, inspected and reconditioned by a master mechanic. Serving Aurora and east Denver.",
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <>
      <RtoContent lang="en" />
      <section className="shopping-tools wrap">
        <div className="section-heading">
          <div>
            <p className="eyebrow">More from Blackline</p>
            <h2>
              Other ways we can <em>help.</em>
            </h2>
          </div>
        </div>
        <div className="tools-grid">
          <Link href="/referrals">
            <Gift />
            <span>01 / REFERRALS</span>
            <h3>Earn $100.</h3>
            <p>Refer someone to rent-to-own and get rewarded when they get rolling.</p>
            <strong>
              How referrals work <ArrowUpRight size={18} />
            </strong>
          </Link>
          <Link href="/sell-your-vehicle">
            <BadgeDollarSign />
            <span>02 / SELL YOUR VEHICLE</span>
            <h3>Have a car or truck to sell?</h3>
            <p>Tell us about it. We buy vehicles, including ones that need work.</p>
            <strong>
              Get an offer <ArrowUpRight size={18} />
            </strong>
          </Link>
          <Link href="/request-vehicle">
            <Search />
            <span>03 / FIND A VEHICLE</span>
            <h3>Paying cash for something specific?</h3>
            <p>Trucks, diesels and work vehicles included. Tell us what you&apos;re after.</p>
            <strong>
              Request a vehicle <ArrowUpRight size={18} />
            </strong>
          </Link>
        </div>
      </section>
    </>
  );
}
