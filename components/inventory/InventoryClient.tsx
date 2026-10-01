"use client";
import { useState } from "react";
import Link from "next/link";
import { Search, SlidersHorizontal, ArrowUpRight } from "lucide-react";
import { VehicleCard } from "@/components/inventory/VehicleCard";
import { LeaseVehicleCard } from "@/components/inventory/LeaseVehicleCard";
import type { Vehicle } from "@/types/vehicle";
export function InventoryClient({
  vehicles,
  mode,
  initialQuery = "",
  initialCategory = "",
  initialMake = "",
  initialBudget = "",
}: {
  vehicles: Vehicle[];
  mode: "sale" | "lease";
  initialQuery?: string;
  initialCategory?: string;
  initialMake?: string;
  initialBudget?: string;
}) {
  const [query, setQuery] = useState(initialQuery),
    [category, setCategory] = useState(initialCategory),
    [make, setMake] = useState(initialMake),
    [budget, setBudget] = useState(initialBudget),
    [sort, setSort] = useState("newest");
  const filtered = vehicles
    .filter(
      (v) =>
        `${v.year} ${v.make} ${v.model} ${v.trim}`
          .toLowerCase()
          .includes(query.toLowerCase()) &&
        (!make || v.make === make) &&
        (!category ||
          v.category.toLowerCase().includes(category) ||
          (category === "car" && !/truck|suv|van/i.test(v.category))) &&
        (!budget || (v.price ?? v.monthlyRate ?? Infinity) <= Number(budget)),
    )
    .sort((a, b) =>
      sort === "low"
        ? (a.price ?? a.monthlyRate ?? Infinity) -
          (b.price ?? b.monthlyRate ?? Infinity)
        : sort === "high"
          ? (b.price ?? b.monthlyRate ?? 0) - (a.price ?? a.monthlyRate ?? 0)
          : sort === "mileage"
            ? a.mileage - b.mileage
            : b.createdAt.localeCompare(a.createdAt),
    );
  function reset() {
    setQuery("");
    setCategory("");
    setMake("");
    setBudget("");
    setSort("newest");
  }
  return (
    <div className={`inventory-browser`}>
      <aside className="inventory-filters">
        <h2>
          <SlidersHorizontal size={18} /> Refine your search
        </h2>
        <label>
          Search vehicles
          <div className="search-input">
            <Search size={17} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Make, model, or year"
            />
          </div>
        </label>
        <label>
          Vehicle type
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All types</option>
            <option value="truck">Trucks</option>
            <option value="suv">SUVs</option>
            <option value="car">Cars</option>
            <option value="van">Vans</option>
          </select>
        </label>
        <label>
          Make
          <select value={make} onChange={(e) => setMake(e.target.value)}>
            <option value="">All makes</option>
            {Array.from(new Set(vehicles.map((v) => v.make)))
              .sort()
              .map((m) => (
                <option key={m}>{m}</option>
              ))}
          </select>
        </label>
        <label>
          {mode === "lease" ? "Monthly budget" : "Maximum price"}
          <select value={budget} onChange={(e) => setBudget(e.target.value)}>
            <option value="">Any price</option>
            {(mode === "sale" ? [20000, 35000, 50000] : [1500, 2500, 5000]).map(
              (n) => (
                <option key={n} value={n}>
                  ${n.toLocaleString()} or less
                </option>
              ),
            )}
          </select>
        </label>
        <button className="clear-filters" type="button" onClick={reset}>
          Clear all filters
        </button>
        <div className="filter-help">
          <strong>Have something else in mind?</strong>
          <p>Tell us what you’re looking for.</p>
          <Link href="/request-vehicle">
            Find my vehicle <ArrowUpRight size={16} />
          </Link>
        </div>
      </aside>
      <div>
        <div className="results-heading">
          <p aria-live="polite">
            <strong>{filtered.length}</strong>{" "}
            {filtered.length === 1 ? "vehicle" : "vehicles"} found
          </p>
          <label>
            Sort by{" "}
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="newest">Recently added</option>
              <option value="low">Price: low to high</option>
              <option value="high">Price: high to low</option>
              <option value="mileage">Lowest mileage</option>
            </select>
          </label>
        </div>
        {filtered.length ? (
          <div className="results-grid">
            {filtered.map((v) =>
              mode === "sale" ? (
                <VehicleCard key={v.id} vehicle={v} />
              ) : (
                <LeaseVehicleCard key={v.id} vehicle={v} />
              ),
            )}
          </div>
        ) : (
          <div className="inventory-empty">
            <Search size={32} />
            <h2>No matches just yet.</h2>
            <p>Try a different search or let us help source your vehicle.</p>
            <button className="red-button" onClick={reset}>
              Reset filters
            </button>
            <Link href="/request-vehicle">
              Request a vehicle <ArrowUpRight size={17} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
