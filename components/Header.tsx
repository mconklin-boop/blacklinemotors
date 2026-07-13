"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/Button";

const nav = [
  ["Vehicles for Sale", "/vehicles"],
  ["Lease Vehicles", "/lease"],
  ["Request a Vehicle", "/request-vehicle"],
  ["Sell Your Vehicle", "/sell-your-vehicle"],
  ["Partnerships", "/partnerships"],
  ["Financing", "/financing"],
  ["About", "/about"],
  ["Contact", "/contact"]
];

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-blackline-black/95 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8" aria-label="Main navigation">
        <Link href="/" className="flex items-center gap-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
          <span className="grid h-10 w-10 place-items-center border border-blackline-steel bg-blackline-graphite text-sm font-black">BM</span>
          <span>
            <span className="block text-sm font-black uppercase tracking-widest text-white">Blackline Motors</span>
            <span className="block text-[10px] uppercase tracking-wide text-blackline-steel">Official logo placeholder</span>
          </span>
        </Link>
        <div className="hidden items-center gap-5 lg:flex">
          {nav.map(([label, href]) => (
            <Link key={href} href={href} className="text-sm font-semibold text-blackline-silver hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
              {label}
            </Link>
          ))}
        </div>
        <div className="hidden lg:block">
          <Button href="/vehicles">Browse Vehicles</Button>
        </div>
        <button
          type="button"
          className="grid h-11 w-11 place-items-center rounded-md border border-white/15 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white lg:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label="Toggle navigation menu"
        >
          {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>
      </nav>
      {open && (
        <div id="mobile-menu" className="border-t border-white/10 bg-blackline-charcoal px-4 py-5 lg:hidden">
          <div className="grid gap-2">
            {nav.map(([label, href]) => (
              <Link key={href} href={href} onClick={() => setOpen(false)} className="rounded-md px-3 py-3 font-semibold text-blackline-silver hover:bg-white/10 hover:text-white">
                {label}
              </Link>
            ))}
            <Button href="/vehicles" className="mt-2" onClick={() => setOpen(false)}>
              Browse Vehicles
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
