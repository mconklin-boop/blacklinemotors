import type { Metadata } from "next";
import { Section } from "@/components/Section";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Blackline Motors privacy policy placeholder for the first production-ready website version."
};

export default function PrivacyPolicyPage() {
  return (
    <Section eyebrow="Legal" title="Privacy Policy">
      <div className="max-w-4xl space-y-5 leading-7 text-blackline-silver">
        <p>This placeholder privacy policy explains that Blackline Motors may collect contact details, vehicle request information, vehicle sale submissions, financing inquiry information, and partnership inquiry information submitted through website forms.</p>
        <p>Submitted information is intended to respond to inquiries, evaluate vehicle opportunities, coordinate appointments, review financing interest, and support business partnerships. Sensitive identity documents, Social Security numbers, and bank account details should not be submitted through this website.</p>
        <p>Future updates should be reviewed by qualified counsel before launch in each operating market.</p>
      </div>
    </Section>
  );
}
