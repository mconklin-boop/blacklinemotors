import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Gauge, MapPin } from "lucide-react";
import { formatCurrency, formatMiles } from "@/lib/format";
import type { Vehicle } from "@/types/vehicle";
export function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  return (
    <article className="vehicle-card">
      <Link
        className="vehicle-photo"
        href={`/vehicle/${vehicle.slug}`}
        aria-label={`View ${vehicle.year} ${vehicle.make} ${vehicle.model}`}
      >
        <Image
          src={vehicle.photos[0]}
          alt={`Illustrative photography for sample ${vehicle.make} ${vehicle.model} listing`}
          fill
          sizes="(min-width: 1100px) 31vw, (min-width: 650px) 46vw, 95vw"
          className="object-cover"
        />
        <span className="photo-label">Sample listing</span>
        <span className="photo-arrow">
          <ArrowUpRight size={20} />
        </span>
      </Link>
      <div className="vehicle-info">
        <div className="vehicle-kicker">
          <span>
            {vehicle.year} · {vehicle.drivetrain}
          </span>
          <span
            className={
              vehicle.availabilityStatus === "Available"
                ? "available"
                : "coming"
            }
          >
            {vehicle.availabilityStatus}
          </span>
        </div>
        <h3>
          <Link href={`/vehicle/${vehicle.slug}`}>
            {vehicle.make} {vehicle.model}
          </Link>
        </h3>
        <p className="vehicle-trim">{vehicle.trim}</p>
        <div className="vehicle-meta">
          <span>
            <Gauge size={15} />
            {formatMiles(vehicle.mileage)}
          </span>
          <span>
            <MapPin size={15} />
            {vehicle.location}
          </span>
        </div>
        <div className="vehicle-price">
          <div>
            <small>Sample asking price</small>
            <strong>{formatCurrency(vehicle.price)}</strong>
          </div>
          <Link href={`/vehicle/${vehicle.slug}`}>
            Explore vehicle <ArrowUpRight size={17} />
          </Link>
        </div>
      </div>
    </article>
  );
}
