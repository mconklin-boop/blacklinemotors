import { formatCurrency, formatMiles } from "@/lib/format";
import type { Vehicle } from "@/types/vehicle";

export function VehicleSpecsTable({ vehicle }: { vehicle: Vehicle }) {
  const rows = [
    ["Year", vehicle.year],
    ["Make", vehicle.make],
    ["Model", vehicle.model],
    ["Trim", vehicle.trim],
    ["VIN", vehicle.vin],
    ["Mileage", formatMiles(vehicle.mileage)],
    ["Exterior Color", vehicle.exteriorColor],
    ["Interior Color", vehicle.interiorColor],
    ["Engine", vehicle.engine],
    ["Transmission", vehicle.transmission],
    ["Drivetrain", vehicle.drivetrain],
    ["Fuel Type", vehicle.fuelType],
    ["Location", vehicle.location],
    ["Title Status", `${vehicle.titleType} - ${vehicle.titleState}`]
  ];

  const leaseRows = [
    ["Monthly Rate", vehicle.monthlyRate ? `${formatCurrency(vehicle.monthlyRate)}/mo` : "Request Pricing"],
    ["Security Deposit", formatCurrency(vehicle.securityDeposit)],
    ["Initial Payment", formatCurrency(vehicle.initialPayment)],
    ["Mileage Allowance", vehicle.mileageAllowance],
    ["Excess Mileage Rate", vehicle.excessMileageRate],
    ["Minimum Term", vehicle.minimumTerm],
    ["Maximum Term", vehicle.maximumTerm],
    ["Maintenance Responsibility", vehicle.maintenanceResponsibility],
    ["Insurance Requirements", vehicle.insuranceRequirements],
    ["Business Qualification", vehicle.qualificationRequirements],
    ["Delivery", vehicle.deliveryAvailable],
    ["Availability Date", vehicle.availabilityDate]
  ];

  const allRows = ["Monthly Lease", "Commercial Rental", "Lease-to-Own"].includes(vehicle.transactionType) ? [...rows, ...leaseRows] : rows;

  return (
    <dl className="grid overflow-hidden rounded-md border border-white/10 sm:grid-cols-2">
      {allRows.map(([label, value]) => (
        <div key={String(label)} className="border-b border-white/10 p-4 even:bg-white/[0.03] sm:border-r">
          <dt className="text-xs font-bold uppercase tracking-wide text-blackline-steel">{label}</dt>
          <dd className="mt-1 text-sm font-semibold text-white">{value ?? "Request details"}</dd>
        </div>
      ))}
    </dl>
  );
}
