import type { Metadata } from "next";
import { Section } from "@/components/Section";
import { InventoryClient } from "@/components/inventory/InventoryClient";
import { saleVehicles } from "@/data/vehicles";

export const metadata: Metadata = {
  title: "Vehicles for Sale",
  description: "Search specialty used vehicles, project vehicles, and rebuilt-title opportunities from Blackline Motors."
};

export default function VehiclesPage() {
  return (
    <Section eyebrow="Inventory" title="Vehicles for Sale">
      <p className="mb-8 max-w-3xl text-blackline-silver">Search by year, make, model, title type, mileage, drivetrain, fuel type, location, and availability. Sample inventory is marked for this first build.</p>
      <InventoryClient vehicles={saleVehicles} mode="sale" />
    </Section>
  );
}
