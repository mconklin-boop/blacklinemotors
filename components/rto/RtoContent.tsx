import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CarFront,
  ClipboardCheck,
  FileCheck2,
  KeyRound,
  Phone,
  Search,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import { PrequalForm } from "@/components/forms/PrequalForm";
import { rtoDisclaimer, rtoTagline, site } from "@/lib/site";

type Lang = "en" | "es";

const copy = {
  en: {
    eyebrow: "Rent-to-own in Aurora & east Denver",
    h1a: "Rent-to-own,",
    h1b: "done right.",
    sub: "Reliable cars and SUVs with clean titles, inspected and reconditioned by a master mechanic before you ever get the keys.",
    ctaPrimary: "Get pre-qualified",
    ctaCall: `Call or text ${site.phoneDisplay}`,
    switchLang: "¿Habla español? Ver esta página en español",
    switchHref: "/es/rent-to-own",
    formAsideTitle: "What happens next",
    formAside: [
      "We email you a link to your secure customer portal.",
      "Upload your license, pay stubs and proof of residence right in the portal.",
      "Get your decision and pick your vehicle from the options we send, all in the portal.",
    ],
    howEyebrow: "How it works",
    howTitle: "Four steps to your keys.",
    steps: [
      { title: "Get pre-qualified", text: "Answer a few quick questions online. No Social Security number. Then upload your documents in your secure portal." },
      { title: "We find your vehicle", text: "We source a reliable, clean-title car or SUV that fits what you need, instead of pushing whatever is on the lot." },
      { title: "Inspected & reconditioned", text: "A master mechanic inspects it and fixes what needs fixing before it's offered to you." },
      { title: "Drive it home", text: "Sign a clear written agreement, set up your insurance, and drive. Keep up with the agreement and the vehicle becomes yours." },
    ],
    whyEyebrow: "Why Blackline",
    whyTitle: "The mechanic is the owner.",
    why: [
      { title: "Master-mechanic inspected", text: "Blackline is owned by a master mechanic with 20+ years in the shop. Every vehicle is checked by the owner, not a salesperson." },
      { title: "Clean titles only", text: "No salvage or rebuilt titles in the rent-to-own program." },
      { title: "Maintenance support", text: "Scheduled maintenance through our partner shop, Iron Ridge Service, helps keep your vehicle running." },
      { title: "Straight answers", text: "Every cost and condition is in writing before you sign. Ask anything." },
    ],
    reqEyebrow: "Requirements",
    reqTitle: "What you'll need.",
    reqIntro: "Rent-to-own is built for people with steady work. To apply, you'll need:",
    reqs: [
      "Gross income of about $3,000 a month or more",
      "6+ months at your current job, with recent pay stubs",
      "Proof of where you live",
      "A valid driver's license",
      "Two references",
      "The ability to carry full-coverage auto insurance",
    ],
    reqNote: "Approval is not guaranteed. Meeting these requirements is the first step.",
    srcEyebrow: "Vehicles we source",
    srcTitle: "Dependable daily drivers.",
    srcText: "We focus on reliable everyday cars and SUVs with clean titles: the kind of vehicle that gets you to work every day. Tell us what you need and we'll look for it.",
    srcTypes: ["Fuel-efficient sedans", "Family SUVs", "Minivans", "Light-duty pickups"],
    faqEyebrow: "Questions",
    faqTitle: "Rent-to-own FAQ.",
    faqs: [
      { q: "How much are the payments?", a: "It depends on the vehicle you choose. Ask for details and we'll walk you through every number in writing before you commit." },
      { q: "Do you have cars on the lot?", a: "We source each vehicle to fit the customer, then inspect and recondition it. That way you aren't stuck choosing from whatever happens to be parked outside." },
      { q: "How long does it take?", a: "After you're approved, it usually takes a few weeks to find, inspect and recondition the right vehicle. We'll keep you updated the whole way." },
      { q: "Is there GPS on the vehicle?", a: "Yes. Vehicles in the program have a GPS device installed. This is explained in your agreement." },
      { q: "What insurance do I need?", a: "Full-coverage auto insurance for the whole agreement, with Blackline Motors listed on the policy. We can explain exactly what's required." },
      { q: "Can I send my documents online?", a: "Please don't send your ID or pay stubs through Facebook or text. After you pre-qualify, you'll get your own secure portal where you upload them directly." },
    ],
    bottomTitle: "Ready to see if you qualify?",
    bottomText: "Two minutes online, or call or text us directly.",
  },
  es: {
    eyebrow: "Renta con opción a compra en Aurora y el este de Denver",
    h1a: "Renta con opción a compra,",
    h1b: "bien hecha.",
    sub: "Carros y SUVs confiables con título limpio, inspeccionados y reacondicionados por un mecánico maestro antes de entregarle las llaves.",
    ctaPrimary: "Precalifique",
    ctaCall: `Llame o escriba al ${site.phoneDisplay}`,
    switchLang: "View this page in English",
    switchHref: "/rent-to-own",
    formAsideTitle: "Qué sigue",
    formAside: [
      "Le enviamos por correo un enlace a su portal de cliente seguro.",
      "Suba su licencia, talones de pago y comprobante de domicilio en el portal.",
      "Reciba su decisión y elija su vehículo entre las opciones que le enviamos, todo en el portal.",
    ],
    howEyebrow: "Cómo funciona",
    howTitle: "Cuatro pasos para sus llaves.",
    steps: [
      { title: "Precalifique", text: "Conteste unas preguntas rápidas en línea. Sin número de Seguro Social. Luego suba sus documentos en su portal seguro." },
      { title: "Buscamos su vehículo", text: "Conseguimos un carro o SUV confiable con título limpio que se ajuste a lo que necesita." },
      { title: "Inspeccionado y reacondicionado", text: "Un mecánico maestro lo inspecciona y repara lo necesario antes de ofrecérselo." },
      { title: "Lléveselo a casa", text: "Firme un contrato claro por escrito, active su seguro y maneje. Cumpla con el contrato y el vehículo será suyo." },
    ],
    whyEyebrow: "Por qué Blackline",
    whyTitle: "El mecánico es el dueño.",
    why: [
      { title: "Inspeccionado por un mecánico experto", text: "Blackline es de un mecánico maestro con más de 20 años de experiencia. El dueño revisa cada vehículo personalmente." },
      { title: "Solo títulos limpios", text: "No usamos títulos de salvamento ni reconstruidos en el programa." },
      { title: "Apoyo de mantenimiento", text: "Mantenimiento programado a través de nuestro taller asociado, Iron Ridge Service." },
      { title: "Respuestas claras", text: "Todos los costos y condiciones se entregan por escrito antes de firmar." },
    ],
    reqEyebrow: "Requisitos",
    reqTitle: "Lo que necesita.",
    reqIntro: "El programa es para personas con trabajo estable. Para aplicar necesita:",
    reqs: [
      "Ingreso bruto de aproximadamente $3,000 al mes o más",
      "6 meses o más en su trabajo actual, con talones de pago recientes",
      "Comprobante de domicilio",
      "Licencia de manejo válida",
      "Dos referencias",
      "Poder mantener seguro de auto de cobertura completa",
    ],
    reqNote: "La aprobación no está garantizada. Cumplir estos requisitos es el primer paso.",
    srcEyebrow: "Vehículos que buscamos",
    srcTitle: "Vehículos confiables para el día a día.",
    srcText: "Nos enfocamos en carros y SUVs confiables con título limpio. Díganos qué necesita y lo buscamos.",
    srcTypes: ["Sedanes económicos", "SUVs familiares", "Minivans", "Camionetas ligeras"],
    faqEyebrow: "Preguntas",
    faqTitle: "Preguntas frecuentes.",
    faqs: [
      { q: "¿Cuánto son los pagos?", a: "Depende del vehículo que elija. Pregunte por los detalles y le explicamos cada número por escrito antes de comprometerse." },
      { q: "¿Tienen carros en el lote?", a: "Buscamos cada vehículo según el cliente y luego lo inspeccionamos y reacondicionamos." },
      { q: "¿Cuánto tiempo toma?", a: "Después de ser aprobado, normalmente toma algunas semanas encontrar, inspeccionar y reacondicionar el vehículo adecuado." },
      { q: "¿El vehículo tiene GPS?", a: "Sí. Los vehículos del programa tienen un dispositivo GPS instalado. Esto se explica en su contrato." },
      { q: "¿Qué seguro necesito?", a: "Seguro de cobertura completa durante todo el contrato, con Blackline Motors incluido en la póliza." },
      { q: "¿Puedo enviar mis documentos en línea?", a: "Por favor no envíe su identificación ni talones de pago por Facebook o mensaje de texto. Después de precalificar, tendrá su propio portal seguro donde puede subirlos directamente." },
    ],
    bottomTitle: "¿Listo para ver si califica?",
    bottomText: "Dos minutos en línea, o llámenos o escríbanos directamente.",
  },
};

const stepIcons = [ClipboardCheck, Search, Wrench, KeyRound];
const whyIcons = [Wrench, FileCheck2, ShieldCheck, BadgeCheck];

export function RtoContent({ lang = "en" }: { lang?: Lang }) {
  const t = copy[lang];
  return (
    <>
      <section className="rto-hero">
        <div className="wrap rto-hero-grid">
          <div>
            <p className="hero-eyebrow">
              <span /> {t.eyebrow}
            </p>
            <h1>
              {t.h1a}
              <br />
              <em>{t.h1b}</em>
            </h1>
            <p className="rto-hero-sub">{t.sub}</p>
            <p className="rto-tagline">{rtoTagline[lang]}</p>
            <div className="hero-actions">
              <a href="#prequal" className="red-button">
                {t.ctaPrimary} <ArrowRight size={18} />
              </a>
              <a href={site.phoneHref} className="outline-button">
                <Phone size={17} /> {t.ctaCall}
              </a>
            </div>
            <Link href={t.switchHref} className="rto-lang-link" hrefLang={lang === "en" ? "es" : "en"}>
              {t.switchLang} →
            </Link>
          </div>
          <div id="prequal" className="rto-form-wrap">
            <PrequalForm lang={lang} />
          </div>
        </div>
      </section>

      <section className="rto-section light">
        <div className="wrap">
          <div className="rto-next">
            <h2>{t.formAsideTitle}</h2>
            <ol>
              {t.formAside.map((item, i) => (
                <li key={item}>
                  <span>{i + 1}</span>
                  {item}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="rto-section light" id="how-it-works">
        <div className="wrap">
          <p className="eyebrow">{t.howEyebrow}</p>
          <h2 className="rto-h2">{t.howTitle}</h2>
          <div className="rto-steps">
            {t.steps.map((step, i) => {
              const Icon = stepIcons[i];
              return (
                <div key={step.title} className="rto-step">
                  <div className="rto-step-top">
                    <Icon size={26} />
                    <span>0{i + 1}</span>
                  </div>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="rto-section dark">
        <div className="wrap">
          <p className="eyebrow">{t.whyEyebrow}</p>
          <h2 className="rto-h2">{t.whyTitle}</h2>
          <div className="rto-why">
            {t.why.map((item, i) => {
              const Icon = whyIcons[i];
              return (
                <div key={item.title}>
                  <Icon size={24} />
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="rto-section light" id="requirements">
        <div className="wrap rto-two-col">
          <div>
            <p className="eyebrow">{t.reqEyebrow}</p>
            <h2 className="rto-h2">{t.reqTitle}</h2>
            <p className="rto-body">{t.reqIntro}</p>
            <ul className="rto-checklist">
              {t.reqs.map((req) => (
                <li key={req}>
                  <BadgeCheck size={20} /> {req}
                </li>
              ))}
            </ul>
            <p className="rto-small">{t.reqNote}</p>
          </div>
          <div>
            <p className="eyebrow">{t.srcEyebrow}</p>
            <h2 className="rto-h2">{t.srcTitle}</h2>
            <p className="rto-body">{t.srcText}</p>
            <div className="rto-chips">
              {t.srcTypes.map((type) => (
                <span key={type}>
                  <CarFront size={16} /> {type}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="rto-section light" id="faq">
        <div className="wrap">
          <p className="eyebrow">{t.faqEyebrow}</p>
          <h2 className="rto-h2">{t.faqTitle}</h2>
          <div className="rto-faq">
            {t.faqs.map((faq) => (
              <details key={faq.q}>
                <summary>{faq.q}</summary>
                <p>{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="rto-section dark rto-bottom">
        <div className="wrap">
          <h2 className="rto-h2">{t.bottomTitle}</h2>
          <p className="rto-tagline">{rtoTagline[lang]}</p>
          <p className="rto-body">{t.bottomText}</p>
          <div className="hero-actions">
            <a href="#prequal" className="red-button">
              {t.ctaPrimary} <ArrowRight size={18} />
            </a>
            <a href={site.phoneHref} className="outline-button">
              <Phone size={17} /> {t.ctaCall}
            </a>
          </div>
          <p className="rto-disclaimer">{rtoDisclaimer[lang]}</p>
        </div>
      </section>
    </>
  );
}
