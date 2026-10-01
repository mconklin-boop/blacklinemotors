import type { Metadata } from "next";
import { InventoryClient } from "@/components/inventory/InventoryClient";
import { saleVehicles } from "@/data/vehicles";
export const metadata: Metadata = {
  title: "Shop Inventory",
  description:
    "Explore the Blackline Motors selection of cars, trucks, and SUVs.",
};
export default async function VehiclesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const get = (key: string) =>
    typeof params[key] === "string" ? (params[key] as string) : "";
  return (
    <div className="inventory-page">
      <div className="inventory-title wrap">
        <p className="eyebrow">The Blackline selection</p>
        <h1>
          Your next drive <em>starts here.</em>
        </h1>
        <p>Find your fit. Explore the details. Make your next move.</p>
      </div>
      <div className="wrap">
        <p className="preview-notice">
          Browse Blackline Motors inventory. Coming-soon vehicles are awaiting diagnosis or preparation; pricing and sale readiness will be updated when confirmed.
        </p>
        <InventoryClient
          key={[get("q"), get("category"), get("make"), get("budget")].join(
            "|",
          )}
          vehicles={saleVehicles}
          mode="sale"
          initialQuery={get("q")}
          initialCategory={get("category")}
          initialMake={get("make")}
          initialBudget={get("budget")}
        />
      </div>
    </div>
  );
}
