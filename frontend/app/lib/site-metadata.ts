export const SITE_ORIGIN = "https://h2oatlas.ee";
export const SITE_NAME = "H2O Atlas";
export const DEFAULT_OG_IMAGE = "/og-default.png";
export const ROOT_PATH = "/";
export const VERIFY_PATH = "/verify";
export const SITEMAP_PATH = "/sitemap.xml";
export const ROOT_TITLE = `${SITE_NAME} - Water Quality Map of Estonia`;
export const ROOT_DESCRIPTION =
  "Interactive map of Estonian water quality powered by Terviseamet open data and ML risk assessments. 69,000+ samples across swimming, drinking water, pools, and source domains.";
export const ROOT_SHORT_DESCRIPTION =
  "Interactive map of Estonian water quality powered by Terviseamet open data and ML risk assessments.";
export const VERIFY_TITLE = `Verify Snapshot - ${SITE_NAME}`;
export const VERIFY_DESCRIPTION =
  "Verify the published H2O Atlas snapshot evidence package and inspect whether the bundle provides full signature verification or integrity-only validation.";
export const VERIFY_SHORT_DESCRIPTION =
  "Check the published H2O Atlas snapshot evidence package and see the verification level returned by the browser verifier.";

export function buildSiteUrl(path: string = ROOT_PATH): string {
  return path === ROOT_PATH ? SITE_ORIGIN : `${SITE_ORIGIN}${path}`;
}

export function buildPlacePageUrl(placeId: string | null): string {
  const url = new URL(SITE_ORIGIN);
  if (placeId) {
    url.searchParams.set("place", placeId);
  }
  return url.toString();
}

export const VERIFY_URL = buildSiteUrl(VERIFY_PATH);
export const SITEMAP_URL = buildSiteUrl(SITEMAP_PATH);
