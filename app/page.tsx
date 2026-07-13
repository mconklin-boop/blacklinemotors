import Image from "next/image";
import { Button } from "@/components/Button";
import { CTASection } from "@/components/CTASection";
import { Section } from "@/components/Section";
import { LeaseVehicleCard } from "@/components/inventory/LeaseVehicleCard";
import { VehicleCard } from "@/components/inventory/VehicleCard";
import { leaseVehicles, saleVehicles } from "@/data/vehicles";

const benefits = [
  "Flexible monthly vehicle options",
  "Commercial and work-ready inventory",
  "Individual and fleet vehicle requests",
  "Delivery options may be available",
  "Maintenance packages may be available",
  "Business-use qualification process"
];

const why = ["Straightforward Vehicle Information", "Specialty and Commercial Inventory", "Flexible Purchase and Leasing Options", "Business-Focused Service"];

export default function Home() {
  return (
    <>
      <section className="relative overflow-hidden bg-blackline-black px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="z-10">
            <p className="mb-4 text-sm font-black uppercase tracking-widest text-blackline-steel">Specialty sales and commercial vehicle access</p>
            <h1 className="text-4xl font-black uppercase leading-tight text-white sm:text-6xl">Vehicles for Work, Business, and Everyday Life.</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-blackline-silver">
              Shop specialty vehicles for sale or secure commercial trucks and fleet vehicles through flexible monthly leasing and rental options.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href="/vehicles">Shop Vehicles</Button>
              <Button href="/lease" variant="secondary">
                View Lease Vehicles
              </Button>
              <Button href="/request-vehicle" variant="ghost">
                Request a Vehicle
              </Button>
            </div>
          </div>
          <div className="relative min-h-[340px] overflow-hidden rounded-md border border-white/10 bg-blackline-graphite shadow-metal sm:min-h-[520px]">
            <Image
              src="https://images.unsplash.com/photo-1591768793355-74d04bb6608f?auto=format&fit=crop&w=1800&q=80"
              alt="Commercial pickup truck placeholder for Blackline Motors"
              fill
              priority
              sizes="(min-width: 1024px) 55vw, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-6">
              <p className="text-sm font-bold uppercase tracking-wide text-white">Large vehicle photography placeholder</p>
            </div>
          </div>
        </div>
      </section>

      <Section eyebrow="Featured inventory" title="Vehicles for Sale">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">{saleVehicles.map((vehicle) => <VehicleCard key={vehicle.id} vehicle={vehicle} />)}</div>
      </Section>

      <Section eyebrow="Commercial access" title="Featured Lease Vehicles" className="bg-blackline-charcoal">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">{leaseVehicles.map((vehicle) => <LeaseVehicleCard key={vehicle.id} vehicle={vehicle} />)}</div>
      </Section>

      <Section title="Put the Right Vehicle to Work.">
        <p className="max-w-4xl text-lg leading-8 text-blackline-silver">
          Blackline Motors helps businesses access commercial trucks and fleet vehicles without the upfront cost of purchasing. Available inventory may include pickup trucks, service-body trucks, cargo vans, flatbeds, dump trucks, box trucks, and other work-ready vehicles.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {benefits.map((benefit) => (
            <div key={benefit} className="rounded-md border border-white/10 bg-blackline-graphite p-5 text-white">
              {benefit}
            </div>
          ))}
        </div>
        <Button href="/request-vehicle" className="mt-8">
          Request a Lease Vehicle
        </Button>
      </Section>

      <Section eyebrow="Why Blackline Motors" title="Built for clear decisions" className="bg-blackline-charcoal">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {why.map((item) => (
            <div key={item} className="rounded-md border border-white/10 bg-blackline-graphite p-6">
              <h3 className="font-black uppercase text-white">{item}</h3>
              <p className="mt-3 text-sm leading-6 text-blackline-silver">Clear information, practical options, and vehicle sourcing support for buyers and businesses.</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="How Buying Works">
        <Steps steps={["Browse available vehicles", "Review vehicle details and disclosures", "Submit an inquiry or schedule an inspection", "Complete payment or approved financing", "Arrange pickup or delivery"]} />
      </Section>

      <Section title="How Commercial Leasing Works" className="bg-blackline-charcoal">
        <Steps steps={["Tell us what type of vehicle your business needs", "Submit your business and driver information", "Review available vehicles and monthly terms", "Sign the applicable rental or lease agreement", "Arrange pickup or delivery"]} />
      </Section>

      <Section>
        <div className="grid gap-6 lg:grid-cols-2">
          <CTASection title="Have a Vehicle to Sell?" text="Blackline Motors considers clean-title vehicles, damaged vehicles, project cars, trade-ins, fleet vehicles, and specialty inventory." href="/sell-your-vehicle" cta="Get a Vehicle Offer" />
          <CTASection title="Partner With Blackline Motors" text="Blackline Motors works with dealerships, fleet providers, rental companies, repair facilities, wholesalers, transport companies, automotive service providers, and business owners needing vehicles." href="/partnerships" cta="Become a Partner" />
        </div>
      </Section>
    </>
  );
}

function Steps({ steps }: { steps: string[] }) {
  return (
    <ol className="grid gap-4 md:grid-cols-5">
      {steps.map((step, index) => (
        <li key={step} className="rounded-md border border-white/10 bg-blackline-graphite p-5">
          <span className="text-sm font-black text-blackline-steel">0{index + 1}</span>
          <p className="mt-3 font-bold text-white">{step}</p>
        </li>
      ))}
    </ol>
  );
}
