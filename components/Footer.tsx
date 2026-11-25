import Link from "next/link";
import { BrandLogo } from "./BrandLogo";
import { ArrowUpRight } from "lucide-react";
import { rtoDisclaimer, site } from "@/lib/site";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-top wrap">
        <div>
          <Link href="/" className="brand">
            <BrandLogo />
          </Link>
          <p>
            Reliable vehicles, inspected by a master mechanic.
            <br />
            Rent-to-own available. Flexible payments. Ask for details.
          </p>
          <span className="footer-location">Serving {site.serviceArea}</span>
        </div>
        <div>
          <h3>Rent-to-own</h3>
          <Link href="/rent-to-own">Rent-to-own program</Link>
          <Link href="/rent-to-own#requirements">Requirements</Link>
          <Link href="/rent-to-own#faq">FAQ</Link>
          <Link href="/es/rent-to-own" hrefLang="es">
            En español
          </Link>
        </div>
        <div>
          <h3>More</h3>
          <Link href="/referrals">Referral reward</Link>
          <Link href="/sell-your-vehicle">Sell your vehicle</Link>
          <Link href="/request-vehicle">Request a vehicle</Link>
          <Link href="/about">About Blackline</Link>
          <Link href="/portal/login">Customer login</Link>
        </div>
        <div>
          <h3>Talk to us</h3>
          <p>
            <a href={site.phoneHref}>Call {site.phoneDisplay}</a>
            <br />
            <a href={site.smsHref}>Text {site.phoneDisplay}</a>
            <br />
            <a href={`mailto:${site.email}`}>{site.email}</a>
          </p>
          <Link className="footer-contact" href="/contact">
            Send a message <ArrowUpRight size={18} />
          </Link>
        </div>
      </div>
      <div className="footer-bottom wrap">
        <span>
          © {new Date().getFullYear()} {site.legalName}
        </span>
        <div>
          <Link href="/privacy-policy">Privacy</Link>
          <Link href="/terms-of-use">Terms</Link>
        </div>
      </div>
      <p className="footer-disclaimer wrap">{rtoDisclaimer.en}</p>
    </footer>
  );
}
