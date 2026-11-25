import { money } from "./account";
import { optionName } from "./applications";
import { VEHICLE_CLASSES, isVehicleClass } from "./pricing";
import type { Customer, PortalDocument, VehicleOption } from "./types";

// PandaDoc REST calls for the "Blackline Motors – RTO Packet (v5)" template.
// Env: PANDADOC_API_KEY (required), PANDADOC_TEMPLATE_ID, PANDADOC_FOLDER_ID.

const API = "https://api.pandadoc.com/public/v1";
const TEMPLATE = process.env.PANDADOC_TEMPLATE_ID || "7CV3gqsyavTfuyyF2cESYm";
const FOLDER = process.env.PANDADOC_FOLDER_ID || "QQ7ndgSSCky7vgBHPoYFLj";
const BLACKLINE_SIGNER = { email: "mike@blacklinemotorsco.com", first_name: "Michael", last_name: "Conklin", role: "Blackline Motors LLC" };
const IRON_RIDGE_SIGNER = { email: "mike@ironridgeservice.com", first_name: "Michael", last_name: "Conklin", role: "Iron Ridge Service LLC" };

export function pandadocEnabled() {
  return Boolean(process.env.PANDADOC_API_KEY);
}

async function call<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      Authorization: `API-Key ${process.env.PANDADOC_API_KEY}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  if (!res.ok) throw new Error(`PandaDoc ${res.status}: ${(await res.text()).slice(0, 300)}`);
  return (res.status === 204 ? {} : await res.json()) as T;
}

export type Purchase = {
  vin: string;
  odometer: string;
  color?: string;
  engine?: string;
  damage?: string;
  deliveryDate: string; // YYYY-MM-DD
  firstDueDate: string; // YYYY-MM-DD
  condition: Partial<Record<"Exterior" | "Interior" | "Tires" | "Brakes" | "Keys" | "WarningLights" | "OilChange" | "RepairsMade", string>>;
};

const usd = (cents: number | null | undefined) => (cents === null || cents === undefined ? "" : money(cents));

function prettyLongDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", { timeZone: "UTC", month: "long", day: "numeric", year: "numeric" });
}
function ordinal(n: number) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
function addMonths(iso: string, months: number) {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1 + months, 1));
  const last = new Date(Date.UTC(dt.getUTCFullYear(), dt.getUTCMonth() + 1, 0)).getUTCDate();
  dt.setUTCDate(Math.min(d, last));
  return dt.toISOString().slice(0, 10);
}

export function buildTokens(customer: Customer, o: VehicleOption, docs: PortalDocument[], purchase?: Purchase) {
  const term = o.term_payments ?? 24;
  const rental = o.rental_cents ?? Math.max(0, o.payment_cents - (o.care_essential_cents ?? 0));
  const ess = o.care_essential_cents ?? 0;
  const plus = o.care_plus_cents ?? ess;
  const rentalTotal = rental * term;
  const down = o.down_payment_cents ?? 0;
  const cls = isVehicleClass(o.vehicle_class) ? VEHICLE_CLASSES[o.vehicle_class].label : "";
  const has = (kind: string) => docs.some((d) => d.kind === kind);
  const address = [customer.address_line1, customer.address_line2, customer.city, [customer.state, customer.zip].filter(Boolean).join(" ")]
    .filter(Boolean)
    .join(", ");

  const t: Record<string, string> = {
    "Lessee.Name": customer.full_name,
    "Lessee.Email": customer.email,
    "Lessee.Phone": customer.phone ?? "",
    "Lessee.Address": address,
    "Lessee.Employer": customer.application.employer ?? "",
    "Vehicle.Description": optionName(o),
    "Vehicle.Class": cls,
    "Vehicle.CashPrice": usd(o.cash_price_cents),
    "Vehicle.DownPayment": usd(down),
    "Vehicle.AuctionSource": o.source ?? "",
    "Vehicle.AuctionLot": o.lot ?? "",
    "Rental.Monthly": usd(rental),
    "Rental.Total": usd(rentalTotal),
    "Rental.OverCash": usd(rentalTotal - (o.cash_price_cents ?? 0)),
    "CarePlan.Essential": usd(ess),
    "CarePlan.Plus": usd(plus),
    "CarePlan.EssentialTotal": usd(ess * term),
    "CarePlan.PlusTotal": usd(plus * term),
    "Payment.Essential": usd(rental + ess),
    "Payment.Plus": usd(rental + plus),
    "Total.Essential": usd(rentalTotal + ess * term),
    "Total.Plus": usd(rentalTotal + plus * term),
    "DueAtSigning.Essential": usd(rental + ess + down),
    "DueAtSigning.Plus": usd(rental + plus + down),
    "GPS.Serial": "to be recorded at installation",
    "GPS.InstallDate": "to be recorded",
    "GPS.InstalledBy": "to be recorded",
    "Office.Decision": customer.review?.outcome === "approved" ? "Approved (automatic document review)" : "Approved",
    "Office.DocumentsProvided": [
      `Driver's license ${has("license") ? "✓" : "—"}`,
      `Pay stubs ${has("income") ? "✓" : "—"}`,
      `Proof of address ${has("residence") ? "✓" : "—"}`,
      "Proof of full-coverage insurance: pending (required before delivery)",
    ].join(" · "),
  };
  if (purchase) {
    Object.assign(t, {
      "Vehicle.VIN": purchase.vin,
      "Vehicle.Odometer": purchase.odometer,
      "Vehicle.Color": purchase.color ?? "",
      "Vehicle.Engine": purchase.engine ?? "",
      "Vehicle.Damage": purchase.damage ?? "",
      "Delivery.Date": prettyLongDate(purchase.deliveryDate),
      "Payment.FirstDueDate": prettyLongDate(purchase.firstDueDate),
      "Payment.DueDay": `the ${ordinal(Number(purchase.firstDueDate.slice(8, 10)))} of each month`,
      "Payment.FinalDate": prettyLongDate(addMonths(purchase.firstDueDate, term - 1)),
    });
    for (const [k, v] of Object.entries(purchase.condition)) if (v) t[`Condition.${k}`] = v;
  }
  return Object.entries(t).map(([name, value]) => ({ name, value }));
}

function splitName(full: string) {
  const parts = full.trim().split(/\s+/);
  return { first_name: parts[0] ?? full, last_name: parts.slice(1).join(" ") || "-" };
}

export async function createDraft(customer: Customer, o: VehicleOption, docs: PortalDocument[], purchase?: Purchase) {
  const doc = await call<{ id: string; status: string }>("/documents", {
    method: "POST",
    body: JSON.stringify({
      name: `${customer.full_name} – RTO Packet – ${optionName(o)}`,
      template_uuid: TEMPLATE,
      folder_uuid: FOLDER,
      recipients: [
        { email: customer.email, ...splitName(customer.full_name), role: "Lessee" },
        BLACKLINE_SIGNER,
        IRON_RIDGE_SIGNER,
      ],
      tokens: buildTokens(customer, o, docs, purchase),
      metadata: { portal_customer_id: customer.id, portal_option_id: o.id },
      tags: ["blackline-portal"],
    }),
  });
  return doc.id;
}

export async function waitForDraft(id: string, tries = 10) {
  for (let i = 0; i < tries; i++) {
    const s = await call<{ status: string }>(`/documents/${id}`);
    if (s.status === "document.draft") return true;
    if (s.status !== "document.uploaded") return false;
    await new Promise((r) => setTimeout(r, 1500));
  }
  return false;
}

export async function updateTokens(id: string, tokens: { name: string; value: string }[]) {
  await call(`/documents/${id}`, { method: "PATCH", body: JSON.stringify({ tokens }) });
}

export async function sendDocument(id: string, firstName: string) {
  await call(`/documents/${id}/send`, {
    method: "POST",
    body: JSON.stringify({
      subject: "Your Blackline Motors rent-to-own agreement",
      message: `Hi ${firstName}, here is your rent-to-own agreement packet from Blackline Motors. Please review every page, choose your Care Plan (Essential or Plus), and sign. Questions? Call or text 720-614-8248.`,
      silent: false,
    }),
  });
}

export const pandadocUrl = (id: string) => `https://app.pandadoc.com/a/#/documents/${id}`;
