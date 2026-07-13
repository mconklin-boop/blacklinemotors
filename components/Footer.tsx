import Link from "next/link";
import { commercialVehicleDisclosure, generalVehicleDisclosure } from "@/lib/disclosures";

const links = [
  ["Vehicles", "/vehicles"],
  ["Lease Vehicles", "/lease"],
  ["Request", "/request-vehicle"],
  ["Sell", "/sell-your-vehicle"],
  ["Partnerships", "/partnerships"],
  ["Financing", "/financing"],
  ["Privacy Policy", "/privacy-policy"],
  ["Terms of Use", "/terms-of-use"]
];

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-blackline-black">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.2fr_1fr_1fr] lg:px-8">
        <div>
          <div className="mb-4 flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center border border-blackline-steel bg-blackline-graphite text-sm font-black">BM</span>
            <div>
              <p className="font-black uppercase tracking-widest text-white">Blackline Motors</p>
              <p className="text-xs uppercase text-blackline-steel">Logo placeholder</p>
            </div>
          </div>
          <p className="max-w-xl text-sm leading-6 text-blackline-silver">{generalVehicleDisclosure}</p>
          <p className="mt-4 max-w-xl text-sm leading-6 text-blackline-silver">{commercialVehicleDisclosure}</p>
        </div>
        <div>
          <h2 className="mb-4 text-sm font-black uppercase tracking-wide text-white">Navigation</h2>
          <div className="grid gap-2">
            {links.map(([label, href]) => (
              <Link key={href} href={href} className="text-sm text-blackline-silver hover:text-white">
                {label}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <h2 className="mb-4 text-sm font-black uppercase tracking-wide text-white">Contact</h2>
          <div className="space-y-2 text-sm text-blackline-silver">
            <p>Phone: (000) 000-0000</p>
            <p>Email: sales@blacklinemotors.example</p>
            <p>Service Area: Mountain West and partner markets</p>
            <p>Social: Instagram, Facebook, LinkedIn placeholders</p>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-5 text-center text-xs text-blackline-steel">
        Copyright {new Date().getFullYear()} Blackline Motors. All rights reserved.
      </div>
    </footer>
  );
}
