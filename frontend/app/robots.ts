import type { MetadataRoute } from "next";
import { SITEMAP_URL, SITE_ORIGIN } from "./lib/site-metadata";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: SITEMAP_URL,
    host: SITE_ORIGIN,
  };
}
