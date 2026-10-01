import Image from "next/image";
import type { Vehicle } from "@/types/vehicle";

export function VehicleGallery({ vehicle }: { vehicle: Vehicle }) {
  const [primary, ...secondary] = vehicle.photos;

  return (
    <div className={`grid gap-4 ${secondary.length ? "lg:grid-cols-[2fr_1fr]" : ""}`}>
      <div className="relative min-h-[320px] overflow-hidden rounded-md bg-white sm:min-h-[520px]">
        <Image
          src={primary}
          alt={`${vehicle.year} ${vehicle.make} ${vehicle.model} main photo`}
          fill
          priority
          sizes="(min-width: 1024px) 66vw, 100vw"
          className="object-cover"
        />
      </div>
      {secondary.length > 0 && <div className="grid gap-4">{secondary.map((photo) => (
        <div key={photo} className="relative min-h-40 overflow-hidden rounded-md bg-white">
          <Image src={photo} alt={`${vehicle.year} ${vehicle.make} ${vehicle.model} gallery photo`} fill sizes="(min-width: 1024px) 33vw, 100vw" className="object-cover" />
        </div>
      ))}</div>}
    </div>
  );
}
