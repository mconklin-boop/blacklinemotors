import type { Metadata } from "next";
import { Field } from "@/components/forms/Field";
import { ValidatedForm } from "@/components/forms/ValidatedForm";
import { Section } from "@/components/Section";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact Blackline Motors for vehicle sales, commercial leasing, appointments, and partnership inquiries.",
};

export default function ContactPage() {
  return (
    <Section eyebrow="Contact" title="Talk with Blackline Motors">
      <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          "Based in Denver, Colorado",
          "Vehicle sales and sourcing",
          "Inspection appointments arranged individually",
          "Online inquiries: setup in progress",
        ].map((item) => (
          <div
            key={item}
            className="rounded-md border border-gray-200 bg-white p-5 text-gray-600"
          >
            {item}
          </div>
        ))}
      </div>
      <ValidatedForm action="/api/contact" submitLabel="Send Message">
        <Field label="Name" name="name" required />
        <Field label="Phone" name="phone" required />
        <Field label="Email" name="email" type="email" required />
        <Field
          label="Appointment Request Option"
          name="appointmentRequest"
          options={[
            "General question",
            "Vehicle inspection",
            "Commercial lease consultation",
            "Partnership call",
          ]}
        />
        <Field label="Message" name="message" required textarea />
      </ValidatedForm>
    </Section>
  );
}
