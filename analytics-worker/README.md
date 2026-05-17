# Analytics Worker

Lightweight Cloudflare Worker ingestion endpoint for `h2oatlas.ee` frontend
events.

## Purpose

This worker gives the existing `sendBeacon` instrumentation in
`frontend/app/lib/analytics.ts` a concrete low-cost destination:

- accepts small POSTed event payloads
- applies minimal schema validation
- stores daily counters in Workers KV
- stores the last-seen event for smoke/debug purposes

This is intentionally not a full analytics warehouse. It is an operational
bridge between frontend instrumentation and lightweight product review.

## Event format

Expected payload:

```json
{
  "event": "dashboard_open",
  "ts": "2026-05-11T12:00:00.000Z",
  "meta": {
    "lang": "ru"
  }
}
```

## KV keys

- `events:YYYY-MM-DD:total`
- `events:YYYY-MM-DD:<event_name>`
- `event:last`

## Local development

```bash
cd analytics-worker
npm install
npx wrangler dev --port 8788
```

Then point the frontend at:

```bash
NEXT_PUBLIC_ANALYTICS_ENDPOINT=http://127.0.0.1:8788 \
PATH=/tmp/node20/node-v20.20.2-linux-x64/bin:$PATH npm run dev
```

## Deploy

1. Create a Workers KV namespace.
2. Replace the placeholder `id` and `preview_id` in `wrangler.toml`.
3. Deploy:

```bash
cd analytics-worker
npm install
npx wrangler deploy
```

4. Set `NEXT_PUBLIC_ANALYTICS_ENDPOINT` in the frontend environment to the
   deployed worker URL.

## Post-deploy smoke test

From the repo root:

```bash
python3 scripts/smoke_analytics_endpoint.py --url https://<your-worker-url>
```

Expected result:

- HTTP `200`
- body `ok`
- `access-control-allow-origin` matches the configured allow-origin

## Operational use

Suggested weekly review:

1. total page opens
2. place selection rate after dashboard open
3. verify-page opens and verification attempts
4. signed-badge clicks
5. history / measurements engagement
6. top error payloads from `event:last` sampling and worker logs

Use the repo helper to pull these counters from live KV:

```bash
python3 scripts/review_analytics_kv.py --days 7
```

For a decision-ready markdown review:

```bash
python3 scripts/review_analytics_kv.py --days 7 --markdown
```
