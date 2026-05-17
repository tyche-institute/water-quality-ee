# Frontend Architecture (Cloudflare + Next.js)

## Goal

Build a fast, professional public UI with production-grade UX while keeping ML inference in batch mode.

## Target stack

- `frontend/`: Next.js 16 (App Router) + React 19 + TypeScript.
- Styling: handcrafted global CSS + design tokens via CSS variables.
- Typography: Google fonts loaded through `next/font` (`Space Grotesk`, `IBM Plex Sans`, `Manrope`).
- UI components: local components in `app/components/*`; no external component framework in the runtime path.
- Map: Leaflet (react-leaflet) with marker clustering and domain filters.
- Data source: precomputed JSON exported into `frontend/public/data/` from `citizen-service/artifacts/snapshot.json`.
- Hosting: Cloudflare Pages (static-first).

## Runtime boundaries

- No model inference in browser or edge on free tier.
- `citizen_model.joblib` stays in offline batch pipeline only.
- Public frontend consumes precomputed probabilities and derived risk labels.

## Deployment model

1. Build/update snapshot via existing Python pipeline.
2. Export frontend-optimized JSON into `frontend/public/data/`:
   - `snapshot.frontend.json` for the initial dashboard payload
   - `snapshot.history.json` for lazy-loaded per-place history
   - `og-index.json` for lightweight metadata / OG rendering
3. Deploy Next.js app to Cloudflare Pages.
4. Optional: add Workers API for analytics collection and future server-side features.

## Why this architecture

- Full UX control over the interface.
- CDN distribution for static assets and map data.
- Predictable free-tier costs with precomputed probabilities.
- Clean path to paid scale-up (Workers Paid) without re-architecture.

## Notes

- The root page (`/`) uses `runtime = "edge"` for per-place metadata generation and Cloudflare compatibility.
- Because the main snapshot is large, it is fetched client-side instead of crossing the React Server Components boundary.
- History is split into a second immutable asset so the first paint stays smaller on mobile networks.
