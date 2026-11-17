import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { site } from "@/lib/site";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

const siteUrl = site.url;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Blackline Motors | Rent-to-Own Cars & SUVs in Aurora, CO",
    template: "%s | Blackline Motors",
  },
  description:
    "Rent-to-own available. Flexible payments. Ask for details. Reliable clean-title cars and SUVs inspected by a master mechanic. Serving Aurora and east Denver.",
  openGraph: {
    title: "Blackline Motors",
    description:
      "Rent-to-own cars and SUVs, inspected and reconditioned by a master mechanic. Serving Aurora and east Denver.",
    url: siteUrl,
    siteName: "Blackline Motors",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blackline Motors",
    description:
      "Rent-to-own cars and SUVs, inspected and reconditioned by a master mechanic.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const schema = {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "AutoDealer"],
    name: "Blackline Motors",
    url: siteUrl,
    telephone: "+1-720-614-8248",
    email: site.email,
    areaServed: ["Aurora, CO", "Denver, CO"],
    address: {
      "@type": "PostalAddress",
      addressRegion: "CO",
      addressLocality: "Aurora",
    },
  };

  return (
    <html lang="en" className={inter.variable}>
      <body className="font-body">
        <Script
          id="blackline-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
