import type { Metadata } from "next";
import { RequestVehicleForm } from "@/components/forms/RequestVehicleForm";
import { Section } from "@/components/Section";

export const metadata: Metadata = {
  title: "Request a Vehicle",
  description:
    "Tell Blackline Motors what vehicle you want to buy and we will look for sourcing opportunities.",
};

export default function RequestVehiclePage() {
  return (
    <Section eyebrow="Vehicle sourcing" title="Request a Vehicle">
      <p className="mb-8 max-w-3xl text-gray-600">
        Looking to buy something specific, like a truck, diesel or work vehicle?
        Tell us what you need and your budget, and we&apos;ll look for sourcing
        opportunities. Interested in rent-to-own? Start at the rent-to-own page
        instead.
      </p>
      <RequestVehicleForm />
    </Section>
  );
}
