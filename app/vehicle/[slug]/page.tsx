import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Script from "next/script";
import { Button } from "@/components/Button";
import { DisclosurePanel } from "@/components/DisclosurePanel";
import { Section } from "@/components/Section";
import { LeaseVehicleCard } from "@/components/inventory/LeaseVehicleCard";
import { VehicleCard } from "@/components/inventory/VehicleCard";
import { VehicleGallery } from "@/components/inventory/VehicleGallery";
import { VehicleSpecsTable } from "@/components/inventory/VehicleSpecsTable";
import { StatusBadge } from "@/components/StatusBadge";
import {
  getSimilarVehicles,
  getVehicleBySlug,
  vehicles,
} from "@/data/vehicles";
import {
  commercialVehicleDisclosure,
  generalVehicleDisclosure,
} from "@/lib/disclosures";
import { formatCurrency } from "@/lib/format";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return vehicles.map((vehicle) => ({ slug: vehicle.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const vehicle = getVehicleBySlug(slug);
  if (!vehicle) return {};
  return {
    title: `${vehicle.year} ${vehicle.make} ${vehicle.model} ${vehicle.trim}`,
    description: `${vehicle.transactionType} vehicle details, disclosures, specs, and inquiry options for ${vehicle.year} ${vehicle.make} ${vehicle.model}.`,
  };
}

export default async function VehicleDetailPage({ params }: Props) {
  const { slug } = await params;
  const vehicle = getVehicleBySlug(slug);
  if (!vehicle) notFound();
  const similar = getSimilarVehicles(vehicle);
  const isLease = [
    "Monthly Lease",
    "Commercial Rental",
    "Lease-to-Own",
  ].includes(vehicle.transactionType);
  const schema = {
    "@context": "https://schema.org",
    "@type": "Vehicle",
    name: `${vehicle.year} ${vehicle.make} ${vehicle.model} ${vehicle.trim}`,
    vehicleIdentificationNumber: vehicle.vin,
    mileageFromOdometer: vehicle.mileage,
    vehicleTransmission: vehicle.transmission,
    fuelType: vehicle.fuelType,
    brand: vehicle.make,
    model: vehicle.model,
  };

  return (
    <>
      <Script
        id={`vehicle-schema-${vehicle.id}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <Section>
        <p className="preview-notice">
          {vehicle.availabilityStatus === "Coming Soon" ? "Coming soon · Pricing and sale readiness pending. This vehicle is not ready for purchase." : "Review the condition disclosures and confirm availability before purchase."}
        </p>
        <VehicleGallery vehicle={vehicle} />
        {vehicle.photoNotes && <p className="mt-4 text-sm text-gray-600">{vehicle.photoNotes}</p>}
        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px]">
          <div>
            <div className="mb-5 flex flex-wrap items-center gap-3">
              <StatusBadge status={vehicle.availabilityStatus} />
              <span className="rounded-sm border border-gray-200 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-gray-600">
                {vehicle.transactionType}
              </span>
              {vehicle.partnerOwnedVehicle && (
                <span className="rounded-sm border border-gray-200 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-gray-600">
                  Partner inventory
                </span>
              )}
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-blackline-black">
              {vehicle.year} {vehicle.make} {vehicle.model} {vehicle.trim}
            </h1>
            <p className="mt-2 text-sm text-gray-600">Stock {vehicle.stockNumber ?? vehicle.id}</p>
            <p className="mt-3 text-2xl font-black text-gray-600">
              {isLease
                ? vehicle.monthlyRate
                  ? `${formatCurrency(vehicle.monthlyRate)}/mo`
                  : "Request Pricing"
                : vehicle.price ? formatCurrency(vehicle.price) : "Pricing pending"}
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              {vehicle.description}
            </p>
            <div className="mt-8">
              <VehicleSpecsTable vehicle={vehicle} />
            </div>
            <div className="mt-8 grid gap-4">
              <DisclosurePanel title="Known Damage">
                {vehicle.knownDamage}
              </DisclosurePanel>
              <DisclosurePanel title="Repairs Completed">
                {vehicle.repairsCompleted}
              </DisclosurePanel>
              <DisclosurePanel title="Known Mechanical Issues">
                {vehicle.knownMechanicalIssues}
              </DisclosurePanel>
              <DisclosurePanel title="Inspection and Pickup">{`Inspection information and pickup or delivery details are confirmed during inquiry. ${vehicle.deliveryAvailable ?? "Delivery may be available by market."}`}</DisclosurePanel>
              <DisclosurePanel title="Vehicle Disclosures">
                <p>{generalVehicleDisclosure}</p>
                {isLease && (
                  <p className="mt-3">{commercialVehicleDisclosure}</p>
                )}
              </DisclosurePanel>
            </div>
          </div>
          <aside className="h-fit rounded-md border border-gray-200 bg-white p-6">
            <h2 className="text-xl font-black uppercase text-blackline-black">
              Start an Inquiry
            </h2>
            <div className="mt-5 grid gap-3">
              <Button href="/financing" className="w-full">
                Financing Inquiry
              </Button>
              <Button href="/contact" variant="secondary" className="w-full">
                Schedule an Inspection
              </Button>
              <Button
                href="/request-vehicle"
                variant="secondary"
                className="w-full"
              >
                Request This Vehicle
              </Button>
            </div>
          </aside>
        </div>
      </Section>
      {similar.length > 0 && (
        <Section title="Similar Vehicles" className="bg-gray-100">
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {similar.map((item) =>
              isLease ? (
                <LeaseVehicleCard key={item.id} vehicle={item} />
              ) : (
                <VehicleCard key={item.id} vehicle={item} />
              ),
            )}
          </div>
        </Section>
      )}
    </>
  );
}
