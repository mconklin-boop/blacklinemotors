import type { Metadata } from "next";
import { RequestVehicleForm } from "@/components/forms/RequestVehicleForm";
import { Section } from "@/components/Section";

export const metadata: Metadata = {
  title: "Request a Vehicle",
  description: "Request a purchase vehicle or commercial lease and rental vehicle through Blackline Motors."
};

export default function RequestVehiclePage() {
  return (
    <Section eyebrow="Vehicle sourcing" title="Request a Vehicle">
      <p className="mb-8 max-w-3xl text-blackline-silver">Tell Blackline Motors what you need to buy, lease, or rent. Commercial requests show additional business-use fields.</p>
      <RequestVehicleForm />
    </Section>
  );
}
