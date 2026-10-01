import type { MetadataRoute } from "next";
import { vehicles } from "@/data/vehicles";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://blacklinemotors.example";
  const routes = [
    "",
    "/vehicles",
    "/lease",
    "/request-vehicle",
    "/sell-your-vehicle",
    "/partnerships",
    "/financing",
    "/about",
    "/contact",
    "/privacy-policy",
    "/terms-of-use",
  ];

  return [
    ...routes.map((route) => ({
      url: `${siteUrl}${route}`,
      lastModified: new Date(),
    })),
    ...vehicles.map((vehicle) => ({
      url: `${siteUrl}/vehicle/${vehicle.slug}`,
      lastModified: new Date(vehicle.createdAt),
    })),
  ];
}
