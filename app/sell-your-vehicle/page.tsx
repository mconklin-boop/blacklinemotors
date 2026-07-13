import type { Metadata } from "next";
import { Field } from "@/components/forms/Field";
import { ValidatedForm } from "@/components/forms/ValidatedForm";
import { Section } from "@/components/Section";

export const metadata: Metadata = {
  title: "Sell Your Vehicle",
  description: "Submit a vehicle for sale, trade-in, consignment, or fleet acquisition review."
};

export default function SellYourVehiclePage() {
  return (
    <Section eyebrow="Vehicle acquisition" title="Sell Your Vehicle">
      <p className="mb-8 max-w-3xl text-blackline-silver">Blackline Motors considers clean-title vehicles, damaged vehicles, project cars, trade-ins, fleet vehicles, and specialty inventory. Photo upload integration is a first-version placeholder.</p>
      <ValidatedForm action="/api/sell-vehicle" submitLabel="Submit Vehicle">
        <Field label="Seller Name" name="sellerName" required />
        <Field label="Phone" name="phone" required />
        <Field label="Email" name="email" type="email" required />
        <Field label="Vehicle Year" name="year" required />
        <Field label="Make" name="make" required />
        <Field label="Model" name="model" required />
        <Field label="Trim" name="trim" />
        <Field label="VIN" name="vin" />
        <Field label="Mileage" name="mileage" required />
        <Field label="Title Type" name="titleType" required options={["Clean", "Rebuilt", "Salvage", "Lien", "Unknown"]} />
        <Field label="Current Payoff Amount" name="payoffAmount" />
        <Field label="Asking Price" name="askingPrice" />
        <Field label="Vehicle Location" name="location" required />
        <Field label="Vehicle Condition" name="condition" required />
        <Field label="Known Damage" name="knownDamage" textarea />
        <Field label="Known Mechanical Issues" name="mechanicalIssues" textarea />
        <Field label="Vehicle Description" name="description" required textarea />
        <Field label="Photo Upload Placeholder" name="photoPlaceholder" type="file" />
        <Field label="Sale Option" name="saleOption" required options={["Sell outright", "Trade-in", "Consignment inquiry", "Fleet vehicle sale"]} />
        <Field label="Preferred Contact Method" name="preferredContactMethod" required options={["Phone", "Email", "Text"]} />
      </ValidatedForm>
    </Section>
  );
}
