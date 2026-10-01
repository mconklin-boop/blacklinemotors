import type { Metadata } from "next";
import { Field } from "@/components/forms/Field";
import { ValidatedForm } from "@/components/forms/ValidatedForm";
import { Section } from "@/components/Section";

const sections = [
  "Dealership partnerships",
  "Fleet provider partnerships",
  "Rental company partnerships",
  "Wholesale vehicle sourcing",
  "Aged inventory opportunities",
  "Consignment opportunities",
  "Vehicle acquisition services",
  "Repair and reconditioning partners",
  "Transport partners",
  "Business fleet referrals",
];

export const metadata: Metadata = {
  title: "Dealer & Fleet Partnerships",
  description:
    "Partner with Blackline Motors for dealer, fleet, rental, transport, acquisition, and automotive service opportunities.",
};

export default function PartnershipsPage() {
  return (
    <Section eyebrow="Partner network" title="Dealer & Fleet Partnerships">
      <div className="mb-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sections.map((item) => (
          <div
            key={item}
            className="rounded-md border border-gray-200 bg-white p-5 font-bold text-blackline-black"
          >
            {item}
          </div>
        ))}
      </div>
      <ValidatedForm
        action="/api/partnership"
        submitLabel="Submit Partnership Inquiry"
      >
        <Field label="Contact Name" name="contactName" required />
        <Field label="Company Name" name="companyName" required />
        <Field label="Phone" name="phone" required />
        <Field label="Email" name="email" type="email" required />
        <Field label="Company Website" name="website" />
        <Field
          label="Partnership Type"
          name="partnershipType"
          required
          options={sections}
        />
        <Field label="Number of Vehicles" name="numberOfVehicles" />
        <Field label="Primary Market" name="primaryMarket" required />
        <Field
          label="Description of Opportunity"
          name="opportunity"
          required
          textarea
        />
        <Field label="Additional Comments" name="comments" textarea />
      </ValidatedForm>
    </Section>
  );
}
