import type { MetadataRoute } from "next";
import { ROOT_SHORT_DESCRIPTION, SITE_NAME } from "./lib/site-metadata";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: SITE_NAME,
    description: ROOT_SHORT_DESCRIPTION,
    start_url: "/",
    display: "standalone",
    background_color: "#f3f7fb",
    theme_color: "#0b1220",
    icons: [
      { src: "/favicon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
