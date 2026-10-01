"use client";
import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import type { Vehicle } from "@/types/vehicle";
import { VehicleCard } from "@/components/inventory/VehicleCard";
const tabs = ["All vehicles", "Trucks", "SUVs", "Cars"];
export function InventorySpotlight({ vehicles, spotlight }: { vehicles: Vehicle[]; spotlight?: Vehicle }) {
  const [tab, setTab] = useState("All vehicles");
  const shown = vehicles.filter(
    (v) =>
      tab === "All vehicles" ||
      (tab === "Trucks"
        ? v.category.toLowerCase().includes("truck")
        : tab === "SUVs" ? v.category.toLowerCase().includes("suv") : v.category.toLowerCase().includes("car")),
  );
  return (
    <section className="spotlight wrap" id="spotlight">
      <div className="section-heading">
        <div>
          <p className="eyebrow">The Blackline selection</p>
          <h2>
            Find your next <em>standout.</em>
          </h2>
        </div>
        <Link className="text-link" href="/vehicles">
          View all inventory <ArrowUpRight size={19} />
        </Link>
      </div>
      {spotlight && (
        <div className="rotating-spotlight">
          <VehicleCard vehicle={spotlight} />
          <div className="rotating-spotlight-copy">
            <p className="eyebrow">In the spotlight</p>
            <h3>{spotlight.year} {spotlight.make} {spotlight.model}</h3>
            <p>{spotlight.description}</p>
            <Link className="red-button" href={`/vehicle/${spotlight.slug}`}>
              Explore this vehicle <ArrowUpRight size={19} />
            </Link>
          </div>
        </div>
      )}
      <div className="inventory-tabs" aria-label="Featured inventory filters">
        {tabs.map((t) => (
          <button
            type="button"
            key={t}
            aria-pressed={tab === t}
            className={t === tab ? "selected" : ""}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="spotlight-grid">
        {shown.map((v) => (
          <VehicleCard key={v.id} vehicle={v} />
        ))}
      </div>
      {shown.length === 0 && <p>No vehicles in this category right now. Browse all inventory or ask us to help find your vehicle.</p>}
      <p className="sample-note">
        Coming-soon vehicles are awaiting preparation. Availability, pricing, and condition are confirmed before purchase.
      </p>
    </section>
  );
}
