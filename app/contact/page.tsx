import type { Metadata } from "next";
import { Field } from "@/components/forms/Field";
import { ValidatedForm } from "@/components/forms/ValidatedForm";
import { Section } from "@/components/Section";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Blackline Motors for vehicle sales, commercial leasing, appointments, and partnership inquiries."
};

export default function ContactPage() {
  return (
    <Section eyebrow="Contact" title="Talk with Blackline Motors">
      <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {["Phone: (000) 000-0000", "Email: sales@blacklinemotors.example", "Hours: By appointment placeholder", "Service Area: Mountain West and partner markets"].map((item) => (
          <div key={item} className="rounded-md border border-white/10 bg-blackline-graphite p-5 text-blackline-silver">
            {item}
          </div>
        ))}
      </div>
      <ValidatedForm action="/api/contact" submitLabel="Send Message">
        <Field label="Name" name="name" required />
        <Field label="Phone" name="phone" required />
        <Field label="Email" name="email" type="email" required />
        <Field label="Appointment Request Option" name="appointmentRequest" options={["General question", "Vehicle inspection", "Commercial lease consultation", "Partnership call"]} />
        <Field label="Message" name="message" required textarea />
      </ValidatedForm>
    </Section>
  );
}
