import "./globals.css";
import type { Metadata, Viewport } from "next";
import {
  DEFAULT_OG_IMAGE,
  ROOT_DESCRIPTION,
  ROOT_SHORT_DESCRIPTION,
  ROOT_TITLE,
  SITE_NAME,
  SITE_ORIGIN,
} from "./lib/site-metadata";

export const metadata: Metadata = {
  title: ROOT_TITLE,
  description: ROOT_DESCRIPTION,
  icons: {
    icon: "/favicon.svg",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.webmanifest",
  metadataBase: new URL(SITE_ORIGIN),
  openGraph: {
    title: ROOT_TITLE,
    description: ROOT_SHORT_DESCRIPTION,
    url: SITE_ORIGIN,
    siteName: SITE_NAME,
    type: "website",
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: ROOT_TITLE }],
  },
  twitter: {
    card: "summary_large_image",
    title: ROOT_TITLE,
    description: ROOT_SHORT_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },
};

// Schema.org JSON-LD: lets Google pick up the site for Dataset Search and
// improves rich-result eligibility (sitelinks, breadcrumb). Two top-level
// graph nodes: a WebSite (search intent) and a Dataset (open-data discovery).
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE_ORIGIN}/#website`,
      url: SITE_ORIGIN,
      name: SITE_NAME,
      description: ROOT_SHORT_DESCRIPTION,
      inLanguage: ["et", "ru", "en"],
    },
    {
      "@type": "Dataset",
      "@id": `${SITE_ORIGIN}/#dataset`,
      name: `${SITE_NAME} - Estonian Water Quality Snapshot`,
      description: "Aggregated and ML-scored snapshot of Estonian water quality samples (swimming, drinking water, pools, sources) from Terviseamet open data.",
      url: SITE_ORIGIN,
      keywords: ["water quality", "Estonia", "Terviseamet", "open data", "machine learning"],
      license: "https://creativecommons.org/licenses/by/4.0/",
      isAccessibleForFree: true,
      creator: { "@type": "Organization", name: "TalTech Masin\u00f5pe 2026" },
      sourceOrganization: { "@type": "Organization", name: "Terviseamet", url: "https://vtiav.sm.ee" },
      spatialCoverage: { "@type": "Place", name: "Estonia" },
    },
  ],
};

// Explicit mobile viewport — Next 16 no longer injects a default tag, so
// without this mobile Safari renders at 980px desktop width and every
// CSS media query in globals.css misfires.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5, // do not lock to 1 — blocks pinch-zoom accessibility
  viewportFit: "cover", // lets env(safe-area-inset-*) take effect on notched iPhones
  themeColor: [
    // Match --bg tokens in globals.css (light: #f3f7fb, dark: #0b1220)
    { media: "(prefers-color-scheme: light)", color: "#f3f7fb" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1220" }
  ]
};

// Inline FOUC-prevention script — applies the saved theme to <body>
// before React hydrates, so users do not see a light flash on dark devices
// (or vice versa) and the mobile shell does not blink between themes.
const themeBootstrap = `(() => {
  try {
    var t = localStorage.getItem('water.ui.theme.v1');
    if (t === 'dark') document.documentElement.dataset.theme = 'dark';
    var l = localStorage.getItem('water.ui.lang') || navigator.language || 'en';
    l = String(l).toLowerCase();
    document.documentElement.lang = l.startsWith('ru') ? 'ru' : (l.startsWith('et') ? 'et' : 'en');
  } catch (e) {}
})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="cyr-ibm">{children}</body>
    </html>
  );
}
