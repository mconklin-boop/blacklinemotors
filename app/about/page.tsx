import type { Metadata } from "next";
import Link from "next/link";
import { Section } from "@/components/Section";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description:
    "Blackline Motors is owned by a master mechanic in Aurora, Colorado. Every rent-to-own vehicle is inspected and reconditioned before it is offered.",
};

export default function AboutPage() {
  return (
    <Section eyebrow="About Blackline Motors" title="A mechanic-owned dealership">
      <div className="max-w-3xl space-y-6 text-lg leading-8 text-gray-600">
        <p>
          Blackline Motors is owned and run by a master mechanic who has spent more than two decades working in truck and
          equipment shops around Denver.
        </p>
        <p>
          That background shapes how we do business. We find vehicles, inspect
          them ourselves, and recondition them before they are offered to anyone.
          In the rent-to-own program we only use vehicles with clean titles.
        </p>
        <p>
          We serve {site.serviceArea}. Have a question? Call or text us at{" "}
          <a className="font-semibold text-blackline-black underline" href={site.phoneHref}>
            {site.phoneDisplay}
          </a>
          , or{" "}
          <Link className="font-semibold text-blackline-black underline" href="/rent-to-own#prequal">
            see if you pre-qualify for rent-to-own
          </Link>
          .
        </p>
        <p className="text-sm text-gray-500">
          Blackline Motors LLC, Denver, Colorado.
        </p>
      </div>
    </Section>
  );
}
