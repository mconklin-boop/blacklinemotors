// Single source of truth for contact details and approved program wording.
// Change ad wording here only after Colorado attorney review.

export const site = {
  name: "Blackline Motors",
  legalName: "Blackline Motors LLC",
  phoneDisplay: "720-614-8248",
  phoneHref: "tel:+17206148248",
  smsHref: "sms:+17206148248",
  email: "mike@blacklinemotorsco.com",
  location: "Aurora, Colorado",
  serviceArea: "Aurora and east Denver",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.blacklinemotorsco.com",
};

// Default safe ad wording. Do not add down payment amounts, payment amounts,
// number of payments, term length or finance charges here without the full
// Regulation Z disclosures approved by counsel.
export const rtoTagline = {
  en: "Rent-to-own available. Flexible payments. Ask for details.",
  es: "Renta con opción a compra disponible. Pagos flexibles. Pregunte por los detalles.",
};

export const rtoDisclaimer = {
  en: "Rent-to-own is subject to application, verification of income, employment and residence, vehicle availability, and a signed written agreement. Not every applicant will qualify. All terms, costs and conditions are provided in writing before you sign.",
  es: "La renta con opción a compra está sujeta a solicitud, verificación de ingresos, empleo y domicilio, disponibilidad del vehículo y un contrato escrito firmado. No todos los solicitantes califican. Todos los términos, costos y condiciones se entregan por escrito antes de firmar.",
};
