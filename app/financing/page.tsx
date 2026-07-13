import type { Metadata } from "next";
import { Field } from "@/components/forms/Field";
import { ValidatedForm } from "@/components/forms/ValidatedForm";
import { Section } from "@/components/Section";

export const metadata: Metadata = {
  title: "Financing",
  description: "Submit a financing inquiry for eligible vehicles. Financing depends on vehicle, buyer qualifications, credit profile, down payment, lender approval, and state requirements."
};

export default function FinancingPage() {
  return (
    <Section eyebrow="Lead inquiry" title="Financing">
      <p className="mb-8 max-w-3xl leading-7 text-blackline-silver">
        Financing options may be available depending on the vehicle, buyer qualifications, credit profile, down payment, lender approval, and state requirements. Blackline Motors does not collect Social Security numbers, bank account details, or sensitive identity documents in this first version.
      </p>
      <ValidatedForm action="/api/financing" submitLabel="Submit Financing Inquiry">
        <Field label="Contact Name" name="contactName" required />
        <Field label="Phone" name="phone" required />
        <Field label="Email" name="email" type="email" required />
        <Field label="Vehicle of Interest" name="vehicleOfInterest" required />
        <Field label="Estimated Down Payment" name="downPayment" />
        <Field label="Monthly Payment Target" name="paymentTarget" />
        <Field label="Employment Status" name="employmentStatus" required options={["Employed", "Self-employed", "Business owner", "Retired", "Other"]} />
        <Field label="Gross Monthly Income Range" name="incomeRange" required options={["Under $3,000", "$3,000-$5,000", "$5,000-$8,000", "$8,000+", "Prefer to discuss"]} />
        <Field label="Trade-In Status" name="tradeInStatus" required options={["No trade", "Have trade-in", "Unsure"]} />
        <Field label="Additional Comments" name="comments" textarea />
      </ValidatedForm>
    </Section>
  );
}
