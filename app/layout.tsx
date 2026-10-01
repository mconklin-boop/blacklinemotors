import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.blacklinemotorsco.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Blackline Motors | Find Your Next Drive",
    template: "%s | Blackline Motors",
  },
  description:
    "Shop specialty vehicles for sale and request commercial trucks or fleet vehicles for monthly lease and rental options.",
  openGraph: {
    title: "Blackline Motors",
    description:
      "Modern automotive dealership and commercial vehicle platform.",
    url: siteUrl,
    siteName: "Blackline Motors",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blackline Motors",
    description:
      "Specialty vehicles, commercial trucks, and transparent vehicle disclosures.",
  },
  alternates: {
    canonical: siteUrl,
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
    address: {
      "@type": "PostalAddress",
      addressRegion: "CO",
      addressLocality: "Denver",
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
