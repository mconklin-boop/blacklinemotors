import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/rent-to-own",
    "/es/rent-to-own",
    "/referrals",
    "/sell-your-vehicle",
    "/request-vehicle",
    "/about",
    "/contact",
    "/privacy-policy",
    "/terms-of-use",
  ];

  return routes.map((route) => ({
    url: `${site.url}${route}`,
    lastModified: new Date(),
  }));
}
