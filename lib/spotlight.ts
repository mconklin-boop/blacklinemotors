import type { Vehicle } from "@/types/vehicle";

const DAY_MS = 86_400_000;
const START_DAY = Date.UTC(2026, 8, 30);
export const SPOTLIGHT_INTERVAL_DAYS = 10;

// Denver calendar days keep the schedule stable across daylight saving changes.
export function selectSpotlight(vehicles: Vehicle[], now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Denver", year: "numeric", month: "numeric", day: "numeric",
  }).formatToParts(now);
  const value = (name: string) => Number(parts.find((part) => part.type === name)?.value);
  const day = Date.UTC(value("year"), value("month") - 1, value("day"));
  const period = Math.max(0, Math.floor((day - START_DAY) / DAY_MS / SPOTLIGHT_INTERVAL_DAYS));
  const eligible = vehicles.filter((vehicle) =>
    ["Available", "Coming Soon"].includes(vehicle.availabilityStatus) && vehicle.photos.length > 0,
  ).sort((a, b) => a.id.localeCompare(b.id));
  return eligible.length ? eligible[period % eligible.length] : undefined;
}
