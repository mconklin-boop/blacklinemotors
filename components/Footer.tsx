import Link from "next/link";
import { BrandLogo } from "./BrandLogo";
import { ArrowUpRight } from "lucide-react";
export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-top wrap">
        <div>
          <Link href="/" className="brand">
            <BrandLogo />
          </Link>
          <p>
            Good vehicles. Clear information.
            <br />
            Your next chapter starts here.
          </p>
          <span className="footer-location">Denver, Colorado</span>
        </div>
        <div>
          <h3>Find your drive</h3>
          <Link href="/vehicles">Shop inventory</Link>
          <Link href="/request-vehicle">Vehicle sourcing</Link>
          <Link href="/lease">Commercial vehicles</Link>
        </div>
        <div>
          <h3>Shopping tools</h3>
          <Link href="/sell-your-vehicle">Sell or trade your vehicle</Link>
          <Link href="/financing">Explore financing</Link>
          <Link href="/about">About Blackline</Link>
        </div>
        <div>
          <h3>Let’s talk vehicles</h3>
          <p>
            Have something in mind?
            <br />
            We’d like to hear about it.
          </p>
          <Link className="footer-contact" href="/contact">
            Get in touch <ArrowUpRight size={18} />
          </Link>
          <Link href="/partnerships">Partner with us</Link>
        </div>
      </div>
      <div className="footer-bottom wrap">
        <span>© {new Date().getFullYear()} Blackline Motors</span>
        <div>
          <Link href="/privacy-policy">Privacy</Link>
          <Link href="/terms-of-use">Terms</Link>
        </div>
      </div>
      <p className="footer-disclaimer wrap">
        Design preview: inventory records and vehicle photography are
        illustrative. Listed vehicles and prices are sample data, not offers for
        sale. Availability, pricing, condition, title, and financing must be
        verified before purchase.
      </p>
    </footer>
  );
}
