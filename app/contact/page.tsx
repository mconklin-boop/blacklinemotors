import type { Metadata } from "next";
import { Field } from "@/components/forms/Field";
import { ValidatedForm } from "@/components/forms/ValidatedForm";
import { Section } from "@/components/Section";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Call, text or message Blackline Motors about rent-to-own, selling your vehicle, or finding a specific vehicle. Serving Aurora and east Denver.",
};

export default function ContactPage() {
  return (
    <Section eyebrow="Contact" title="Talk with Mike">
      <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          ["Call", site.phoneDisplay, site.phoneHref],
          ["Text", site.phoneDisplay, site.smsHref],
          ["Email", site.email, `mailto:${site.email}`],
          ["Area", `Serving ${site.serviceArea}`, ""],
        ].map(([label, value, href]) => (
          <div
            key={label}
            className="rounded-md border border-gray-200 bg-white p-5 text-gray-600"
          >
            <span className="block text-xs font-bold uppercase tracking-widest text-gray-400">
              {label}
            </span>
            {href ? (
              <a href={href} className="font-semibold text-blackline-black underline">
                {value}
              </a>
            ) : (
              <span className="font-semibold text-blackline-black">{value}</span>
            )}
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
            "Rent-to-own question",
            "Selling my vehicle",
            "Finding a specific vehicle",
            "General question",
          ]}
        />
        <Field label="Message" name="message" required textarea />
      </ValidatedForm>
    </Section>
  );
}
