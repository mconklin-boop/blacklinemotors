import type { Metadata } from "next";
import { DisclosurePanel } from "@/components/DisclosurePanel";
import { Section } from "@/components/Section";
import { commercialVehicleDisclosure, generalVehicleDisclosure } from "@/lib/disclosures";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Blackline Motors website terms placeholder and vehicle disclosure language."
};

export default function TermsPage() {
  return (
    <Section eyebrow="Legal" title="Terms of Use">
      <div className="max-w-4xl space-y-5 leading-7 text-blackline-silver">
        <p>This first-version terms page is a placeholder for website use terms, inventory information, form submissions, and future partner integrations.</p>
        <DisclosurePanel>{generalVehicleDisclosure}</DisclosurePanel>
        <DisclosurePanel title="Commercial Lease Disclosure">{commercialVehicleDisclosure}</DisclosurePanel>
        <p>Final legal language should be reviewed by qualified counsel before public launch.</p>
      </div>
    </Section>
  );
}
