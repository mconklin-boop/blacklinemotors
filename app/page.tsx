import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  BadgeDollarSign,
  CarFront,
  ClipboardCheck,
  CreditCard,
  FileCheck2,
  FileText,
  Gift,
  KeyRound,
  MessageSquare,
  Phone,
  Search,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import { rtoDisclaimer, rtoTagline, site } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: "Blackline Motors | Rent-to-Own Cars, SUVs & Trucks in Aurora, CO" },
  description:
    "Reliable clean-title cars, SUVs and trucks, inspected and reconditioned by a master mechanic. Rent-to-own available. Flexible payments. Ask for details. Serving Aurora and east Denver.",
  alternates: { canonical: "/" },
};

const programs = [
  {
    icon: KeyRound,
    tag: "01 / Rent-to-own",
    title: "Drive now. Own it later.",
    text: "Steady job? Get into a reliable, inspected vehicle with a clear written agreement. No credit pulled.",
    cta: "Get pre-qualified",
    href: "/rent-to-own#prequal",
    featured: true,
  },
  {
    icon: Search,
    tag: "02 / Find a vehicle",
    title: "Looking for something specific?",
    text: "Paying cash for a car, truck, diesel or work vehicle? Tell us what you're after and we'll hunt it down.",
    cta: "Request a vehicle",
    href: "/request-vehicle",
  },
  {
    icon: BadgeDollarSign,
    tag: "03 / Sell your vehicle",
    title: "Have a car or truck to sell?",
    text: "Tell us about it. We buy vehicles, including ones that need work.",
    cta: "Get an offer",
    href: "/sell-your-vehicle",
  },
  {
    icon: Gift,
    tag: "04 / Referrals",
    title: "Earn $100.",
    text: "Send someone our way for rent-to-own and get rewarded when they get rolling.",
    cta: "How referrals work",
    href: "/referrals",
  },
];

const promises = [
  {
    icon: Wrench,
    title: "Master-mechanic inspected",
    text: "Blackline is owned by a master mechanic with 20+ years in the shop. Every vehicle is checked by the owner, not a salesperson.",
  },
  {
    icon: CarFront,
    title: "Sourced for you",
    text: "No lot full of leftovers. We find the vehicle that fits what you need, then recondition it before it's offered to you.",
  },
  {
    icon: ShieldCheck,
    title: "Clean titles",
    text: "No salvage or rebuilt titles in the rent-to-own program.",
  },
  {
    icon: FileCheck2,
    title: "Everything in writing",
    text: "Every cost and condition is in writing before you sign. Ask anything. You'll get a straight answer.",
  },
];

const steps = [
  { icon: ClipboardCheck, title: "Get pre-qualified", text: "A few quick questions online, then upload documents in your secure portal." },
  { icon: Search, title: "We find your vehicle", text: "We source a reliable, clean-title vehicle that fits what you need." },
  { icon: Wrench, title: "Inspected & reconditioned", text: "A master mechanic inspects it and fixes what needs fixing first." },
  { icon: KeyRound, title: "Drive it home", text: "Sign a clear written agreement, set up insurance, and drive." },
];

const portalFeatures = [
  { icon: CreditCard, text: "Make payments from your bank account" },
  { icon: FileText, text: "View your agreement and documents" },
  { icon: ShieldCheck, text: "Upload your insurance card" },
  { icon: MessageSquare, text: "Message us and request a payoff quote" },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="rto-hero">
        <div className="wrap rto-hero-grid">
          <div>
            <p className="hero-eyebrow">
              <span /> Aurora &amp; east Denver · Owned by a master mechanic
            </p>
            <h1>
              Reliable vehicles. <em>Straight answers.</em>
            </h1>
            <p className="rto-hero-sub">
              Blackline Motors sources, inspects and reconditions dependable cars, SUVs and trucks, then gets
              you behind the wheel through rent-to-own. Every vehicle is checked by a master mechanic before
              you get the keys.
            </p>
            <p className="rto-tagline">{rtoTagline.en}</p>
            <div className="hero-actions">
              <Link href="/rent-to-own#prequal" className="red-button">
                Get pre-qualified <ArrowRight size={16} />
              </Link>
              <a href={site.phoneHref} className="outline-button">
                <Phone size={16} /> Call or text {site.phoneDisplay}
              </a>
            </div>
            <Link href="/es/rent-to-own" hrefLang="es" className="rto-lang-link">
              ¿Habla español? Ver en español
            </Link>
          </div>

          <div className="home-portal-card">
            <p className="eyebrow">Already a customer?</p>
            <h2>Your account, online.</h2>
            <ul>
              {portalFeatures.map(({ icon: Icon, text }) => (
                <li key={text}>
                  <Icon size={18} /> {text}
                </li>
              ))}
            </ul>
            <Link href="/portal/login" className="red-button">
              Customer login <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Programs */}
      <section className="rto-section light">
        <div className="wrap">
          <p className="eyebrow">What we do</p>
          <h2 className="rto-h2">Four ways we can help.</h2>
          <div className="home-programs">
            {programs.map(({ icon: Icon, tag, title, text, cta, href, featured }) => (
              <Link key={href} href={href} className={`home-program${featured ? " featured" : ""}`}>
                <Icon />
                <span>{tag}</span>
                <h3>{title}</h3>
                <p>{text}</p>
                <strong>
                  {cta} <ArrowUpRight size={18} />
                </strong>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How we work */}
      <section className="rto-section dark">
        <div className="wrap">
          <p className="eyebrow">How we work</p>
          <h2 className="rto-h2">The mechanic is the owner.</h2>
          <div className="rto-why">
            {promises.map(({ icon: Icon, title, text }) => (
              <div key={title}>
                <Icon size={28} />
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Rent-to-own steps */}
      <section className="rto-section light">
        <div className="wrap">
          <p className="eyebrow">Rent-to-own</p>
          <h2 className="rto-h2">Four steps to your keys.</h2>
          <div className="rto-steps">
            {steps.map(({ icon: Icon, title, text }, i) => (
              <div key={title} className="rto-step">
                <div className="rto-step-top">
                  <Icon size={26} />
                  <span>0{i + 1}</span>
                </div>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            ))}
          </div>
          <div className="hero-actions home-actions">
            <Link href="/rent-to-own" className="red-button">
              How rent-to-own works <ArrowRight size={16} />
            </Link>
            <Link href="/rent-to-own#requirements" className="outline-button dark-outline">
              See requirements
            </Link>
          </div>
        </div>
      </section>

      {/* Maintenance */}
      <section className="rto-section light">
        <div className="wrap rto-two-col home-care">
          <div>
            <p className="eyebrow">Maintenance</p>
            <h2 className="rto-h2">Maintenance on schedule.</h2>
            <p className="rto-body">
              Rent-to-own vehicles come with an Iron Ridge Care Plan, so oil changes, inspections and other
              scheduled maintenance are handled by our partner shop, Iron Ridge Service. It&apos;s shown as its own
              line in your agreement.
            </p>
            <p className="rto-small">
              The Care Plan covers scheduled maintenance only. It is not a warranty and does not cover repairs.
            </p>
          </div>
          <ul className="rto-checklist">
            <li>
              <BadgeCheck size={18} /> Scheduled oil changes and inspections
            </li>
            <li>
              <BadgeCheck size={18} /> Done by a shop that knows your vehicle
            </li>
            <li>
              <BadgeCheck size={18} /> Helps keep your vehicle reliable for the whole agreement
            </li>
            <li>
              <BadgeCheck size={18} />{" "}
              <a href="https://www.ironridgeservice.com" target="_blank" rel="noopener" className="home-link">
                Learn about Iron Ridge Service
              </a>
            </li>
          </ul>
        </div>
      </section>

      {/* CTA band */}
      <section className="rto-section dark rto-bottom">
        <div className="wrap">
          <p className="eyebrow">Ready to get rolling?</p>
          <h2 className="rto-h2">Start with one call. We&apos;ll take it from there.</h2>
          <p className="rto-body">Two minutes online, or call or text us directly.</p>
          <div className="hero-actions">
            <Link href="/rent-to-own#prequal" className="red-button">
              Get pre-qualified <ArrowRight size={16} />
            </Link>
            <a href={site.phoneHref} className="outline-button">
              <Phone size={16} /> Call {site.phoneDisplay}
            </a>
            <a href={site.smsHref} className="outline-button">
              <MessageSquare size={16} /> Text us
            </a>
          </div>
          <p className="rto-disclaimer">{rtoDisclaimer.en}</p>
        </div>
      </section>
    </>
  );
}
