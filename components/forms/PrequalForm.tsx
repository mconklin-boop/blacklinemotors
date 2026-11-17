"use client";

import { useEffect, useRef, useState } from "react";
import { MessageSquare, Phone, ShieldCheck } from "lucide-react";
import { site } from "@/lib/site";

type Lang = "en" | "es";

const copy = {
  en: {
    title: "Get pre-qualified",
    intro: "Takes about 2 minutes. No documents needed here.",
    name: "Full name",
    phone: "Mobile phone",
    income: "Gross monthly income (before taxes)",
    job: "Time at current job",
    address: "Time at current address",
    vehicle: "Vehicle you want",
    select: "Select one",
    incomeOptions: ["Under $2,500", "$2,500 – $2,999", "$3,000 – $3,999", "$4,000 – $4,999", "$5,000 or more"],
    timeOptions: ["Less than 6 months", "6 – 12 months", "1 – 2 years", "More than 2 years"],
    vehicleOptions: ["Car / sedan", "SUV", "Minivan", "Truck", "Not sure yet"],
    consent: `I agree that Blackline Motors may call or text me at this number about my inquiry. Message and data rates may apply. Consent is not a condition of any purchase.`,
    privacy: "Never send your ID, pay stubs or bank info through Facebook or text. We collect documents in person or by secure upload.",
    submit: "Check if I pre-qualify",
    sending: "Sending...",
    callNow: "Call Mike",
    textNow: "Text Mike",
  },
  es: {
    title: "Precalifique",
    intro: "Toma unos 2 minutos. No necesita documentos aquí.",
    name: "Nombre completo",
    phone: "Teléfono celular",
    income: "Ingreso mensual bruto (antes de impuestos)",
    job: "Tiempo en su trabajo actual",
    address: "Tiempo en su domicilio actual",
    vehicle: "Vehículo que busca",
    select: "Seleccione",
    incomeOptions: ["Menos de $2,500", "$2,500 – $2,999", "$3,000 – $3,999", "$4,000 – $4,999", "$5,000 o más"],
    timeOptions: ["Menos de 6 meses", "6 – 12 meses", "1 – 2 años", "Más de 2 años"],
    vehicleOptions: ["Carro / sedán", "SUV", "Minivan", "Camioneta (pickup)", "Todavía no sé"],
    consent: `Acepto que Blackline Motors me llame o envíe mensajes de texto a este número sobre mi solicitud. Pueden aplicar tarifas de mensajes y datos. El consentimiento no es condición de compra.`,
    privacy: "Nunca envíe su identificación, talones de pago ni datos bancarios por Facebook o mensaje de texto. Recibimos documentos en persona o por un enlace seguro.",
    submit: "Ver si precalifico",
    sending: "Enviando...",
    callNow: "Llamar a Mike",
    textNow: "Mensaje a Mike",
  },
} as const;

const TRACKING_KEY = "blm_first_touch";

type Tracking = {
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmContent: string;
  referrer: string;
  landingPage: string;
};

function readTracking(): Tracking {
  const params = new URLSearchParams(window.location.search);
  const current: Tracking = {
    utmSource: params.get("utm_source") ?? "",
    utmMedium: params.get("utm_medium") ?? "",
    utmCampaign: params.get("utm_campaign") ?? "",
    utmContent: params.get("utm_content") ?? "",
    referrer: document.referrer.slice(0, 300),
    landingPage: window.location.pathname + window.location.search,
  };
  // Keep the first touch for this visitor so the lead is credited to the
  // channel that brought them in. Storage can be unavailable; ignore errors.
  try {
    const saved = window.localStorage.getItem(TRACKING_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as Tracking;
      if (!current.utmSource || parsed.utmSource) return parsed;
    }
    window.localStorage.setItem(TRACKING_KEY, JSON.stringify(current));
  } catch {
    /* storage blocked */
  }
  return current;
}

export function PrequalForm({ lang = "en" }: { lang?: Lang }) {
  const t = copy[lang];
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const tracking = useRef<Tracking | null>(null);

  useEffect(() => {
    tracking.current = readTracking();
  }, []);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");
    const form = event.currentTarget;
    const payload = {
      ...Object.fromEntries(new FormData(form).entries()),
      language: lang,
      ...(tracking.current ?? {}),
    };
    try {
      const response = await fetch("/api/prequalify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as { message?: string };
      setStatus(response.ok ? "success" : "error");
      setMessage(data.message ?? "");
      if (response.ok) form.reset();
    } catch {
      setStatus("error");
      setMessage(
        lang === "es"
          ? `No pudimos enviar su información. Llame o envíe un mensaje al ${site.phoneDisplay}.`
          : `We couldn't send your info. Please call or text ${site.phoneDisplay}.`,
      );
    }
  }

  const input =
    "w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-base text-blackline-black outline-none focus:border-blackline-red";
  const label = "mb-1.5 block text-sm font-bold text-blackline-black";

  if (status === "success") {
    return (
      <div className="prequal-card" role="status">
        <ShieldCheck className="text-emerald-600" size={36} />
        <h3 className="mt-3 text-2xl font-extrabold text-blackline-black">
          {lang === "es" ? "¡Recibido!" : "Got it!"}
        </h3>
        <p className="mt-2 text-gray-700">{message}</p>
        <ContactButtons lang={lang} />
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="prequal-card" noValidate={false}>
      <h3 className="text-2xl font-extrabold text-blackline-black">{t.title}</h3>
      <p className="mb-5 mt-1 text-sm text-gray-600">{t.intro}</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className={label}>{t.name} *</span>
          <input name="name" required autoComplete="name" maxLength={120} className={input} />
        </label>
        <label className="block sm:col-span-2">
          <span className={label}>{t.phone} *</span>
          <input name="phone" type="tel" required autoComplete="tel" inputMode="tel" className={input} />
        </label>
        <SelectField name="monthlyIncome" label={t.income} options={t.incomeOptions} placeholder={t.select} full />
        <SelectField name="timeAtJob" label={t.job} options={t.timeOptions} placeholder={t.select} />
        <SelectField name="timeAtAddress" label={t.address} options={t.timeOptions} placeholder={t.select} />
        <SelectField name="vehicleWanted" label={t.vehicle} options={t.vehicleOptions} placeholder={t.select} full />
      </div>
      <label className="mt-5 flex items-start gap-3 text-sm leading-6 text-gray-700">
        <input type="checkbox" name="contactConsent" value="yes" required className="mt-1 h-5 w-5 accent-[#e62e2e]" />
        <span>{t.consent}</span>
      </label>
      <p className="mt-4 rounded-md bg-gray-100 p-3 text-xs leading-5 text-gray-600">{t.privacy}</p>
      {status === "error" && (
        <div className="mt-4 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-800" role="alert">
          {message}
          <ContactButtons lang={lang} />
        </div>
      )}
      <button
        type="submit"
        disabled={status === "loading"}
        className="red-button mt-5 w-full justify-center"
      >
        {status === "loading" ? t.sending : t.submit}
      </button>
    </form>
  );
}

function SelectField({
  name,
  label,
  options,
  placeholder,
  full = false,
}: {
  name: string;
  label: string;
  options: readonly string[];
  placeholder: string;
  full?: boolean;
}) {
  return (
    <label className={`block ${full ? "sm:col-span-2" : ""}`}>
      <span className="mb-1.5 block text-sm font-bold text-blackline-black">{label} *</span>
      <select
        name={name}
        required
        defaultValue=""
        className="w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-base text-blackline-black outline-none focus:border-blackline-red"
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

export function ContactButtons({ lang = "en" }: { lang?: Lang }) {
  const t = copy[lang];
  return (
    <div className="mt-4 flex flex-wrap gap-3">
      <a href={site.phoneHref} className="red-button">
        <Phone size={18} /> {t.callNow}
      </a>
      <a href={site.smsHref} className="outline-button dark-outline">
        <MessageSquare size={18} /> {t.textNow}
      </a>
    </div>
  );
}
