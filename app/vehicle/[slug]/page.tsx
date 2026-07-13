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
import { getSimilarVehicles, getVehicleBySlug, vehicles } from "@/data/vehicles";
import { commercialVehicleDisclosure, generalVehicleDisclosure } from "@/lib/disclosures";
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
    description: `${vehicle.transactionType} vehicle details, disclosures, specs, and inquiry options for ${vehicle.year} ${vehicle.make} ${vehicle.model}.`
  };
}

export default async function VehicleDetailPage({ params }: Props) {
  const { slug } = await params;
  const vehicle = getVehicleBySlug(slug);
  if (!vehicle) notFound();
  const similar = getSimilarVehicles(vehicle);
  const isLease = ["Monthly Lease", "Commercial Rental", "Lease-to-Own"].includes(vehicle.transactionType);
  const schema = {
    "@context": "https://schema.org",
    "@type": "Vehicle",
    name: `${vehicle.year} ${vehicle.make} ${vehicle.model} ${vehicle.trim}`,
    vehicleIdentificationNumber: vehicle.vin,
    mileageFromOdometer: vehicle.mileage,
    vehicleTransmission: vehicle.transmission,
    fuelType: vehicle.fuelType,
    brand: vehicle.make,
    model: vehicle.model
  };

  return (
    <>
      <Script id={`vehicle-schema-${vehicle.id}`} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <Section>
        <VehicleGallery vehicle={vehicle} />
        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px]">
          <div>
            <div className="mb-5 flex flex-wrap items-center gap-3">
              <StatusBadge status={vehicle.availabilityStatus} />
              <span className="rounded-sm border border-white/15 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-blackline-silver">{vehicle.transactionType}</span>
              {vehicle.partnerOwnedVehicle && <span className="rounded-sm border border-white/15 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-blackline-silver">Partner inventory</span>}
            </div>
            <h1 className="text-4xl font-black uppercase text-white">
              {vehicle.year} {vehicle.make} {vehicle.model} {vehicle.trim}
            </h1>
            <p className="mt-3 text-2xl font-black text-blackline-silver">{isLease ? (vehicle.monthlyRate ? `${formatCurrency(vehicle.monthlyRate)}/mo` : "Request Pricing") : formatCurrency(vehicle.price)}</p>
            <p className="mt-6 text-lg leading-8 text-blackline-silver">{vehicle.description}</p>
            <div className="mt-8">
              <VehicleSpecsTable vehicle={vehicle} />
            </div>
            <div className="mt-8 grid gap-4">
              <DisclosurePanel title="Known Damage">{vehicle.knownDamage}</DisclosurePanel>
              <DisclosurePanel title="Repairs Completed">{vehicle.repairsCompleted}</DisclosurePanel>
              <DisclosurePanel title="Known Mechanical Issues">{vehicle.knownMechanicalIssues}</DisclosurePanel>
              <DisclosurePanel title="Inspection and Pickup">{`Inspection information and pickup or delivery details are confirmed during inquiry. ${vehicle.deliveryAvailable ?? "Delivery may be available by market."}`}</DisclosurePanel>
              <DisclosurePanel title="Vehicle Disclosures">
                <p>{generalVehicleDisclosure}</p>
                {isLease && <p className="mt-3">{commercialVehicleDisclosure}</p>}
              </DisclosurePanel>
            </div>
          </div>
          <aside className="h-fit rounded-md border border-white/10 bg-blackline-graphite p-6">
            <h2 className="text-xl font-black uppercase text-white">Start an Inquiry</h2>
            <div className="mt-5 grid gap-3">
              <Button href="/financing" className="w-full">
                Financing Inquiry
              </Button>
              <Button href="/contact" variant="secondary" className="w-full">
                Schedule an Inspection
              </Button>
              <Button href="/request-vehicle" variant="secondary" className="w-full">
                Request This Vehicle
              </Button>
            </div>
          </aside>
        </div>
      </Section>
      {similar.length > 0 && (
        <Section title="Similar Vehicles" className="bg-blackline-charcoal">
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {similar.map((item) => (isLease ? <LeaseVehicleCard key={item.id} vehicle={item} /> : <VehicleCard key={item.id} vehicle={item} />))}
          </div>
        </Section>
      )}
    </>
  );
}
