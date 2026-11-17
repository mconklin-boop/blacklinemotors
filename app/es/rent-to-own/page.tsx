import type { Metadata } from "next";
import { RtoContent } from "@/components/rto/RtoContent";

export const metadata: Metadata = {
  title: "Renta con opción a compra de carros y SUVs en Aurora, CO",
  description:
    "Renta con opción a compra disponible. Pagos flexibles. Pregunte por los detalles. Carros y SUVs confiables con título limpio, inspeccionados por un mecánico certificado.",
  alternates: {
    canonical: "/es/rent-to-own",
    languages: { "en-US": "/rent-to-own", "es-US": "/es/rent-to-own" },
  },
};

export default function RentToOwnSpanishPage() {
  return (
    <div lang="es">
      <RtoContent lang="es" />
    </div>
  );
}
