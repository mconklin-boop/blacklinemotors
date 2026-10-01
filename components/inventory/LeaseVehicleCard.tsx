import Image from "next/image";
import { Button } from "@/components/Button";
import { StatusBadge } from "@/components/StatusBadge";
import { formatCurrency, formatMiles } from "@/lib/format";
import type { Vehicle } from "@/types/vehicle";

export function LeaseVehicleCard({ vehicle }: { vehicle: Vehicle }) {
  return (
    <article className="overflow-hidden rounded-md border border-gray-200 bg-white">
      <div className="relative aspect-[4/3] bg-gray-100">
        <Image
          src={vehicle.photos[0]}
          alt={`${vehicle.year} ${vehicle.make} ${vehicle.model} commercial vehicle`}
          fill
          sizes="(min-width: 1024px) 33vw, 100vw"
          className="object-cover"
        />
      </div>
      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-black uppercase text-blackline-black">
              {vehicle.year} {vehicle.make} {vehicle.model}
            </h3>
            <p className="text-sm text-gray-600">{vehicle.trim}</p>
          </div>
          <StatusBadge status={vehicle.availabilityStatus} />
        </div>
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-gray-500">Category</dt>
            <dd className="font-semibold text-blackline-black">
              {vehicle.category}
            </dd>
          </div>
          <div>
            <dt className="text-gray-500">Monthly Rate</dt>
            <dd className="font-semibold text-blackline-black">
              {vehicle.monthlyRate
                ? `${formatCurrency(vehicle.monthlyRate)}/mo`
                : "Request Pricing"}
            </dd>
          </div>
          <div>
            <dt className="text-gray-500">Deposit</dt>
            <dd className="font-semibold text-blackline-black">
              {formatCurrency(vehicle.securityDeposit)}
            </dd>
          </div>
          <div>
            <dt className="text-gray-500">Mileage</dt>
            <dd className="font-semibold text-blackline-black">
              {vehicle.mileageAllowance ?? formatMiles(vehicle.mileage)}
            </dd>
          </div>
          <div>
            <dt className="text-gray-500">Min. Term</dt>
            <dd className="font-semibold text-blackline-black">
              {vehicle.minimumTerm ?? "Request terms"}
            </dd>
          </div>
          <div>
            <dt className="text-gray-500">Location</dt>
            <dd className="font-semibold text-blackline-black">
              {vehicle.location}
            </dd>
          </div>
        </dl>
        <Button
          href={`/vehicle/${vehicle.slug}`}
          variant="secondary"
          className="w-full"
        >
          View Lease Details
        </Button>
      </div>
    </article>
  );
}
