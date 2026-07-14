"use client";

import Link from "next/link";
import Image from "next/image";
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
    <header className="sticky top-0 z-50 border-b border-white/10 bg-blackline-black/90 shadow-[0_18px_60px_rgba(0,0,0,0.32)] backdrop-blur-xl">
      <div className="h-1 bg-gradient-to-r from-blackline-steel via-white to-blackline-steel" />
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8" aria-label="Main navigation">
        <Link
          href="/"
          className="group flex min-w-0 items-center gap-3 rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
        >
          <span className="relative h-14 w-36 overflow-hidden rounded-sm border border-white/10 bg-gradient-to-br from-zinc-700 to-black shadow-inner sm:w-44">
            <Image
              src="/blackline-logo-header.png"
              alt="Blackline Motors"
              fill
              priority
              sizes="176px"
              className="object-contain p-1.5 transition duration-200 group-hover:scale-[1.02]"
            />
          </span>
          <span className="hidden border-l border-white/15 pl-3 xl:block">
            <span className="block text-[11px] font-black uppercase tracking-[0.28em] text-white">Blackline Motors</span>
            <span className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-blackline-steel">Sales / Lease / Fleet</span>
          </span>
        </Link>
        <div className="hidden items-center gap-1 rounded-md border border-white/10 bg-white/[0.04] p-1.5 lg:flex">
          {nav.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              className="rounded-sm px-3 py-2 text-xs font-bold uppercase tracking-wide text-blackline-silver transition hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              {label}
            </Link>
          ))}
        </div>
        <div className="hidden shrink-0 lg:block">
          <Button href="/vehicles">Browse Vehicles</Button>
        </div>
        <button
          type="button"
          className="grid h-11 w-11 shrink-0 place-items-center rounded-md border border-white/15 bg-white/[0.04] text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white lg:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label="Toggle navigation menu"
        >
          {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>
      </nav>
      {open && (
        <div id="mobile-menu" className="border-t border-white/10 bg-blackline-black/98 px-4 py-5 shadow-metal lg:hidden">
          <div className="grid gap-2 rounded-md border border-white/10 bg-white/[0.04] p-2">
            {nav.map(([label, href]) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="rounded-sm px-3 py-3 text-sm font-bold uppercase tracking-wide text-blackline-silver hover:bg-white/10 hover:text-white"
              >
                {label}
              </Link>
            ))}
            <Button href="/vehicles" className="mt-2 w-full" onClick={() => setOpen(false)}>
              Browse Vehicles
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
