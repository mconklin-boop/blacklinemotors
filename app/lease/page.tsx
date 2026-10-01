import type { Metadata } from "next";
import { DisclosurePanel } from "@/components/DisclosurePanel";
import { Section } from "@/components/Section";
import { InventoryClient } from "@/components/inventory/InventoryClient";
import { leaseVehicles } from "@/data/vehicles";
import { commercialVehicleDisclosure } from "@/lib/disclosures";

export const metadata: Metadata = {
  title: "Lease & Rental Vehicles",
  description:
    "Browse commercial trucks, cargo vans, service-body trucks, box trucks, and work vehicles for monthly lease or rental.",
};

export default function LeasePage() {
  return (
    <Section eyebrow="Commercial inventory" title="Lease & Rental Vehicles">
      <p className="mb-6 max-w-3xl text-gray-600">
        Find work-ready vehicles including half-ton pickups, three-quarter-ton
        pickups, one-ton pickups, cargo vans, service-body trucks, flatbeds,
        dump trucks, box trucks, and specialty commercial vehicles.
      </p>
      <div className="mb-8">
        <DisclosurePanel title="Commercial Vehicle Disclosure">
          {commercialVehicleDisclosure}
        </DisclosurePanel>
      </div>
      <InventoryClient vehicles={leaseVehicles} mode="lease" />
    </Section>
  );
}
