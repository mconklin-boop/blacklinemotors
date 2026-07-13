"use client";

import { useMemo, useState } from "react";
import { EmptyInventoryState } from "@/components/EmptyInventoryState";
import { FilterControls, FilterSelect } from "@/components/inventory/FilterControls";
import { LeaseVehicleCard } from "@/components/inventory/LeaseVehicleCard";
import { SearchBar } from "@/components/inventory/SearchBar";
import { VehicleCard } from "@/components/inventory/VehicleCard";
import type { Vehicle } from "@/types/vehicle";

function unique(values: string[]) {
  return Array.from(new Set(values)).sort();
}

export function InventoryClient({ vehicles, mode }: { vehicles: Vehicle[]; mode: "sale" | "lease" }) {
  const [query, setQuery] = useState("");
  const [make, setMake] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [availability, setAvailability] = useState("");
  const [drivetrain, setDrivetrain] = useState("");
  const [fuelType, setFuelType] = useState("");
  const [titleType, setTitleType] = useState("");
  const [sort, setSort] = useState("Newest");

  const filtered = useMemo(() => {
    const normalizedQuery = query.toLowerCase();
    return vehicles
      .filter((vehicle) => {
        const haystack = `${vehicle.year} ${vehicle.make} ${vehicle.model} ${vehicle.trim} ${vehicle.category} ${vehicle.location}`.toLowerCase();
        return (
          haystack.includes(normalizedQuery) &&
          (!make || vehicle.make === make) &&
          (!category || vehicle.category === category) &&
          (!location || vehicle.location === location) &&
          (!availability || vehicle.availabilityStatus === availability) &&
          (!drivetrain || vehicle.drivetrain === drivetrain) &&
          (!fuelType || vehicle.fuelType === fuelType) &&
          (!titleType || vehicle.titleType === titleType)
        );
      })
      .sort((a, b) => {
        if (sort === "Lowest price") return (a.price ?? a.monthlyRate ?? 0) - (b.price ?? b.monthlyRate ?? 0);
        if (sort === "Highest price") return (b.price ?? b.monthlyRate ?? 0) - (a.price ?? a.monthlyRate ?? 0);
        if (sort === "Lowest mileage") return a.mileage - b.mileage;
        if (sort === "Highest mileage") return b.mileage - a.mileage;
        return b.createdAt.localeCompare(a.createdAt);
      });
  }, [availability, category, drivetrain, fuelType, location, make, query, sort, titleType, vehicles]);

  return (
    <div className="space-y-6">
      <SearchBar value={query} onChange={setQuery} />
      <FilterControls>
        <FilterSelect label="Make" value={make} onChange={setMake} options={unique(vehicles.map((vehicle) => vehicle.make))} />
        <FilterSelect label="Category" value={category} onChange={setCategory} options={unique(vehicles.map((vehicle) => vehicle.category))} />
        {mode === "sale" && <FilterSelect label="Title Type" value={titleType} onChange={setTitleType} options={unique(vehicles.map((vehicle) => vehicle.titleType))} />}
        <FilterSelect label="Drivetrain" value={drivetrain} onChange={setDrivetrain} options={unique(vehicles.map((vehicle) => vehicle.drivetrain))} />
        <FilterSelect label="Fuel Type" value={fuelType} onChange={setFuelType} options={unique(vehicles.map((vehicle) => vehicle.fuelType))} />
        <FilterSelect label="Location" value={location} onChange={setLocation} options={unique(vehicles.map((vehicle) => vehicle.location))} />
        <FilterSelect label="Availability" value={availability} onChange={setAvailability} options={unique(vehicles.map((vehicle) => vehicle.availabilityStatus))} />
        <FilterSelect label="Sort" value={sort} onChange={setSort} options={["Newest", "Lowest price", "Highest price", "Lowest mileage", "Highest mileage"]} />
      </FilterControls>
      {filtered.length === 0 ? (
        <EmptyInventoryState />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((vehicle) => (mode === "sale" ? <VehicleCard key={vehicle.id} vehicle={vehicle} /> : <LeaseVehicleCard key={vehicle.id} vehicle={vehicle} />))}
        </div>
      )}
    </div>
  );
}
