import type { Metadata } from "next";
import { Section } from "@/components/Section";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn about Blackline Motors and its focus on specialty vehicles, commercial trucks, transparent disclosures, and automotive partnerships.",
};

export default function AboutPage() {
  return (
    <Section
      eyebrow="About Blackline Motors"
      title="Specialty and commercial vehicle access"
    >
      <div className="max-w-4xl space-y-6 text-lg leading-8 text-gray-600">
        <p>
          Blackline Motors is being built as a modern automotive dealership and
          commercial vehicle platform focused on specialty vehicles,
          auction-sourced opportunities, commercial trucks, and work vehicles.
        </p>
        <p>
          The business emphasizes transparent vehicle disclosures, flexible
          acquisition options, and practical support for buyers, businesses,
          dealers, fleet operators, and automotive partners.
        </p>
        <p>
          Available inventory may include used vehicles, rebuilt-title
          opportunities, project vehicles, commercial trucks, rental-ready
          vehicles, and vehicle requests sourced through approved channels and
          partners.
        </p>
      </div>
    </Section>
  );
}
