"use client";
import Link from "next/link";
import { BrandLogo } from "./BrandLogo";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ArrowUpRight, Menu, X, MapPin, Phone, MessageSquare } from "lucide-react";
import { site } from "@/lib/site";

const links = [
  ["Rent-to-own", "/rent-to-own"],
  ["How it works", "/rent-to-own#how-it-works"],
  ["Requirements", "/rent-to-own#requirements"],
  ["Referrals", "/referrals"],
  ["Sell your vehicle", "/sell-your-vehicle"],
  ["Español", "/es/rent-to-own"],
];

export function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const spanish = pathname.startsWith("/es");
  const prequalHref = spanish ? "/es/rent-to-own#prequal" : "/rent-to-own#prequal";
  return (
    <header className="site-header">
      <div className="utility-bar">
        <span>
          <MapPin size={12} /> Serving {site.serviceArea}
        </span>
        <span>Rent-to-own available. Flexible payments. Ask for details.</span>
        <span className="utility-links">
          <Link href="/portal/login">Customer login</Link>
          <a href={site.phoneHref}>
            <Phone size={12} /> {site.phoneDisplay}
          </a>
        </span>
      </div>
      <div className="nav-shell">
        <Link
          className="brand"
          href="/"
          aria-label="Blackline Motors home"
          onClick={() => setOpen(false)}
        >
          <BrandLogo />
        </Link>
        <nav className="desktop-nav" aria-label="Main navigation">
          {links.map(([label, href]) => (
            <Link
              className={pathname === href ? "active" : ""}
              href={href}
              key={href}
              hrefLang={href.startsWith("/es") ? "es" : undefined}
            >
              {label}
            </Link>
          ))}
        </nav>
        <a className="nav-call" href={site.phoneHref}>
          <Phone size={15} /> {site.phoneDisplay}
        </a>
        <Link className="nav-shop" href={prequalHref}>
          {spanish ? "Precalifique" : "Get pre-qualified"} <ArrowUpRight size={16} />
        </Link>
        <button
          className="menu-toggle"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <nav
          id="mobile-menu"
          className="mobile-nav"
          aria-label="Mobile navigation"
        >
          {links.map(([label, href]) => (
            <Link href={href} key={href} onClick={() => setOpen(false)}>
              {label}
              <ArrowUpRight size={17} />
            </Link>
          ))}
          <Link href="/portal/login" onClick={() => setOpen(false)}>
            Customer login
            <ArrowUpRight size={17} />
          </Link>
          <Link href="/contact" onClick={() => setOpen(false)}>
            Contact
            <ArrowUpRight size={17} />
          </Link>
        </nav>
      )}
      <div className="mobile-call-bar">
        <a href={site.phoneHref}>
          <Phone size={16} /> {spanish ? "Llamar" : "Call"}
        </a>
        <a href={site.smsHref}>
          <MessageSquare size={16} /> {spanish ? "Texto" : "Text"}
        </a>
        <Link href={prequalHref}>{spanish ? "Precalifique" : "Pre-qualify"}</Link>
      </div>
    </header>
  );
}
