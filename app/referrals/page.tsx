import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Gift, Phone } from "lucide-react";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Referral Reward",
  description:
    "Know someone who needs a reliable vehicle? Refer them to the Blackline Motors rent-to-own program and earn a $100 referral reward.",
  alternates: { canonical: "/referrals" },
};

export default function ReferralsPage() {
  return (
    <section className="rto-section light">
      <div className="wrap rto-narrow">
        <Gift size={40} className="text-[#e62e2e]" />
        <p className="eyebrow mt-4">Referral reward</p>
        <h1 className="rto-h2">Know someone who needs a ride? Earn $100.</h1>
        <p className="rto-body">
          Send a friend, coworker or family member our way. When they join the
          rent-to-own program and make their first three payments on time, we
          send you $100.
        </p>
        <ol className="rto-numbered">
          <li>Share this website or Mike&apos;s number: {site.phoneDisplay}.</li>
          <li>Have them mention your name when they apply or when Mike calls.</li>
          <li>After their first three on-time payments, you get $100.</li>
        </ol>
        <div className="hero-actions">
          <Link href="/rent-to-own#prequal" className="red-button">
            Send them to pre-qualify <ArrowRight size={18} />
          </Link>
          <a href={site.phoneHref} className="outline-button dark-outline">
            <Phone size={17} /> Call or text {site.phoneDisplay}
          </a>
        </div>
        <p className="rto-small">
          One reward per new customer who signs a rent-to-own agreement. Reward is
          paid after the customer&apos;s first three payments are made on time.
          Blackline Motors may change or end this program at any time; rewards
          already earned will still be paid.
        </p>
      </div>
    </section>
  );
}
