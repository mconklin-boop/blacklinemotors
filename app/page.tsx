import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Compass,
  KeyRound,
  BadgeDollarSign,
} from "lucide-react";
import { InventorySpotlight } from "@/components/InventorySpotlight";
import { saleVehicles } from "@/data/vehicles";
const hero =
  "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=2400&q=85";
const categories = [
  {
    name: "Trucks",
    desc: "Built to get it done.",
    filter: "truck",
    image:
      "https://images.unsplash.com/photo-1551830820-330a71b99659?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "SUVs",
    desc: "Go beyond the everyday.",
    filter: "suv",
    image:
      "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Cars",
    desc: "Make every mile yours.",
    filter: "car",
    image:
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=80",
  },
];
export default function HomePage() {
  return (
    <>
      <section className="dealer-hero">
        <Image
          src={hero}
          alt="Performance car on an open road, illustrative brand photography"
          fill
          priority
          sizes="100vw"
          className="hero-photo"
        />
        <div className="hero-shade" />
        <div className="hero-content wrap">
          <p className="hero-eyebrow">
            <span /> A different kind of dealership
          </p>
          <h1>
            Your drive.
            <br />
            Your <em>statement.</em>
          </h1>
          <p className="hero-description">
            Standout cars. Capable trucks. Adventure-ready SUVs.
            <br className="desktop-break" /> Find a vehicle that feels like you.
          </p>
          <div className="hero-actions">
            <Link href="/vehicles" className="red-button">
              Explore inventory <ArrowUpRight size={20} />
            </Link>
            <Link href="/request-vehicle" className="outline-button">
              Find my vehicle <ArrowRight size={18} />
            </Link>
          </div>
        </div>
        <div className="hero-bottom wrap">
          <span>BLACKLINE MOTORS / DENVER, CO</span>
          <a href="#spotlight">
            Discover the selection <span>↓</span>
          </a>
        </div>
      </section>
      <section className="search-band">
        <div className="search-shell wrap">
          <div>
            <span className="eyebrow">Let’s find your fit</span>
            <h2>What moves you?</h2>
          </div>
          <form action="/vehicles" className="home-search">
            <label>
              Vehicle type
              <select name="category" defaultValue="">
                <option value="">All vehicle types</option>
                <option value="truck">Trucks</option>
                <option value="suv">SUVs</option>
                <option value="car">Cars</option>
              </select>
            </label>
            <label>
              Make
              <select name="make" defaultValue="">
                <option value="">All makes</option>
                {Array.from(new Set(saleVehicles.map((v) => v.make)))
                  .sort()
                  .map((m) => (
                    <option key={m}>{m}</option>
                  ))}
              </select>
            </label>
            <label>
              Budget
              <select name="budget" defaultValue="">
                <option value="">Any price</option>
                <option value="20000">Under $20,000</option>
                <option value="35000">Under $35,000</option>
                <option value="50000">Under $50,000</option>
              </select>
            </label>
            <button type="submit" className="red-button">
              <Search size={18} /> Search inventory
            </button>
          </form>
        </div>
      </section>
      <div className="confidence-strip wrap">
        <span>
          <ShieldCheck size={19} /> Clear vehicle information
        </span>
        <span>
          <SlidersHorizontal size={19} /> A selection for your lifestyle
        </span>
        <span>
          <Compass size={19} /> Personal vehicle sourcing
        </span>
      </div>
      <InventorySpotlight vehicles={saleVehicles.filter((v) => v.featured)} />
      <section className="category-section wrap">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Choose your lane</p>
            <h2>
              A drive for every <em>direction.</em>
            </h2>
          </div>
          <p className="section-aside">
            The daily commute. The weekend escape.
            <br />
            The next big job. Start here.
          </p>
        </div>
        <div className="category-grid">
          {categories.map((c) => (
            <Link
              key={c.name}
              href={`/vehicles?category=${c.filter}`}
              className="category-tile"
            >
              <Image
                src={c.image}
                alt={`${c.name} category, illustrative photography`}
                fill
                sizes="(min-width: 750px) 31vw, 100vw"
                className="object-cover"
              />
              <div className="category-shade" />
              <div>
                <span>{c.desc}</span>
                <h3>
                  {c.name}
                  <ArrowUpRight size={28} />
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </section>
      <section className="sourcing-section">
        <div className="sourcing-photo">
          <Image
            src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=1400&q=85"
            alt="View from behind the wheel, illustrative photography"
            fill
            sizes="(min-width: 800px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
        <div className="sourcing-content">
          <p className="eyebrow">You have a vision. We have the drive.</p>
          <h2>
            Your next vehicle.
            <br />
            <em>Found for you.</em>
          </h2>
          <p>
            Know what you want but haven’t found it yet? Tell us your must-haves
            and budget. We’ll help explore sourcing opportunities, including
            vehicles coming through auction.
          </p>
          <Link href="/request-vehicle" className="red-button">
            Start my vehicle search <ArrowUpRight size={20} />
          </Link>
          <small>
            Sourcing is subject to availability, inspection, and final purchase
            terms.
          </small>
        </div>
      </section>
      <section className="shopping-tools wrap">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Your next move</p>
            <h2>
              More ways to get <em>going.</em>
            </h2>
          </div>
        </div>
        <div className="tools-grid">
          <Link href="/sell-your-vehicle">
            <BadgeDollarSign />
            <span>01 / SELL & TRADE</span>
            <h3>Time for something new?</h3>
            <p>
              Tell us about your current vehicle and explore your next step.
            </p>
            <strong>
              Sell or trade your vehicle <ArrowUpRight size={18} />
            </strong>
          </Link>
          <Link href="/financing">
            <KeyRound />
            <span>02 / FINANCING</span>
            <h3>Explore your options.</h3>
            <p>
              Start a conversation about a vehicle and a budget that works for
              you.
            </p>
            <strong>
              Explore financing <ArrowUpRight size={18} />
            </strong>
          </Link>
          <Link href="/contact">
            <Compass />
            <span>03 / LET’S TALK</span>
            <h3>A little guidance goes far.</h3>
            <p>
              Questions about a vehicle? Let’s help you find the right
              direction.
            </p>
            <strong>
              Contact Blackline <ArrowUpRight size={18} />
            </strong>
          </Link>
        </div>
      </section>
      <section className="brand-banner wrap">
        <p>THE ROAD AHEAD IS YOURS.</p>
        <h2>
          Make it a <em>Blackline.</em>
        </h2>
        <Link className="red-button" href="/vehicles">
          Find your next drive <ArrowUpRight size={20} />
        </Link>
      </section>
    </>
  );
}
