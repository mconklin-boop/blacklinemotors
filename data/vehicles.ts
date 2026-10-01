import type { Vehicle } from "@/types/vehicle";
import inventory from "./inventory.json";

export const vehicles: Vehicle[] = inventory as Vehicle[];

export const saleVehicles = vehicles.filter((vehicle) => vehicle.transactionType === "For Sale");

export const leaseVehicles = vehicles.filter((vehicle) =>
  ["Monthly Lease", "Commercial Rental", "Lease-to-Own"].includes(vehicle.transactionType)
);

export function getVehicleBySlug(slug: string) {
  return vehicles.find((vehicle) => vehicle.slug === slug);
}

export function getSimilarVehicles(vehicle: Vehicle) {
  return vehicles
    .filter((candidate) => candidate.id !== vehicle.id && candidate.transactionType === vehicle.transactionType)
    .slice(0, 3);
}

