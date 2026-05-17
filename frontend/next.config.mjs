import path from "node:path";
import { fileURLToPath } from "node:url";

/** @type {import('next').NextConfig} */
// Cache-bust the snapshot fetch on every deploy. `/data/snapshot.frontend.json`
// is served with `Cache-Control: public, max-age=31536000, immutable` (see
// public/_headers), so without a version-tagged URL, any returning visitor
// would be stuck with the snapshot their browser cached on first visit.
// Cloudflare Pages sets CF_PAGES_COMMIT_SHA at build time; GitHub Actions
// sets GITHUB_SHA; otherwise fall back to the build wall-clock so local dev
// builds still invalidate on restart.
const SNAPSHOT_VERSION =
  process.env.CF_PAGES_COMMIT_SHA ||
  process.env.GITHUB_SHA ||
  String(Date.now());
const FRONTEND_ROOT = path.dirname(fileURLToPath(import.meta.url));

const nextConfig = {
  typedRoutes: true,
  turbopack: {
    root: FRONTEND_ROOT,
  },
  env: {
    NEXT_PUBLIC_SNAPSHOT_VERSION: SNAPSHOT_VERSION.slice(0, 12),
  },
};

export default nextConfig;
