"use client";
import Link from "next/link";
import { BrandLogo } from "./BrandLogo";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ArrowUpRight, Menu, X, MapPin } from "lucide-react";
const links = [
  ["Inventory", "/vehicles"],
  ["Sell / trade", "/sell-your-vehicle"],
  ["Find my vehicle", "/request-vehicle"],
  ["Financing", "/financing"],
  ["About us", "/about"],
];
export function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  return (
    <header className="site-header">
      <div className="utility-bar">
        <span>
          <MapPin size={12} /> Denver, Colorado
        </span>
        <span>Independent. Driven by you.</span>
        <Link href="/contact">
          Contact our team <ArrowUpRight size={12} />
        </Link>
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
            >
              {label}
            </Link>
          ))}
        </nav>
        <Link className="nav-shop" href="/vehicles">
          Shop inventory <ArrowUpRight size={16} />
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
          <Link href="/contact" onClick={() => setOpen(false)}>
            Contact us
            <ArrowUpRight size={17} />
          </Link>
        </nav>
      )}
    </header>
  );
}
