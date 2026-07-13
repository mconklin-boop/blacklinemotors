import Image from "next/image";
import { Button } from "@/components/Button";
import { StatusBadge } from "@/components/StatusBadge";
import { formatCurrency, formatMiles } from "@/lib/format";
import type { Vehicle } from "@/types/vehicle";

export function LeaseVehicleCard({ vehicle }: { vehicle: Vehicle }) {
  return (
    <article className="overflow-hidden rounded-md border border-white/10 bg-blackline-graphite">
      <div className="relative aspect-[4/3] bg-blackline-charcoal">
        <Image src={vehicle.photos[0]} alt={`${vehicle.year} ${vehicle.make} ${vehicle.model} commercial vehicle`} fill sizes="(min-width: 1024px) 33vw, 100vw" className="object-cover" />
      </div>
      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-black uppercase text-white">
              {vehicle.year} {vehicle.make} {vehicle.model}
            </h3>
            <p className="text-sm text-blackline-silver">{vehicle.trim}</p>
          </div>
          <StatusBadge status={vehicle.availabilityStatus} />
        </div>
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-blackline-steel">Category</dt>
            <dd className="font-semibold text-white">{vehicle.category}</dd>
          </div>
          <div>
            <dt className="text-blackline-steel">Monthly Rate</dt>
            <dd className="font-semibold text-white">{vehicle.monthlyRate ? `${formatCurrency(vehicle.monthlyRate)}/mo` : "Request Pricing"}</dd>
          </div>
          <div>
            <dt className="text-blackline-steel">Deposit</dt>
            <dd className="font-semibold text-white">{formatCurrency(vehicle.securityDeposit)}</dd>
          </div>
          <div>
            <dt className="text-blackline-steel">Mileage</dt>
            <dd className="font-semibold text-white">{vehicle.mileageAllowance ?? formatMiles(vehicle.mileage)}</dd>
          </div>
          <div>
            <dt className="text-blackline-steel">Min. Term</dt>
            <dd className="font-semibold text-white">{vehicle.minimumTerm ?? "Request terms"}</dd>
          </div>
          <div>
            <dt className="text-blackline-steel">Location</dt>
            <dd className="font-semibold text-white">{vehicle.location}</dd>
          </div>
        </dl>
        <Button href={`/vehicle/${vehicle.slug}`} variant="secondary" className="w-full">
          View Lease Details
        </Button>
      </div>
    </article>
  );
}
