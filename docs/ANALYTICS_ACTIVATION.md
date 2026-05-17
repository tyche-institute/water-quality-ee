# Analytics Activation

This file is the shortest path from "repo support exists" to "telemetry is
actually live".

## Current status

Completed:

- frontend event emitter: `frontend/app/lib/analytics.ts`
- deployable Cloudflare Worker: `analytics-worker/`
- endpoint smoke script: `scripts/smoke_analytics_endpoint.py`
- review helper: `scripts/review_analytics_kv.py`
- GitHub Actions workflow: `.github/workflows/analytics-worker.yml`
- Workers KV namespaces created and bound in `analytics-worker/wrangler.toml`
- Worker deployed on custom domain: `https://analytics.h2oatlas.ee`
- Pages preview and production env var set:
  `NEXT_PUBLIC_ANALYTICS_ENDPOINT=https://analytics.h2oatlas.ee`
- production Pages rebuild retried successfully on `2026-05-11`

Live smoke result:

- `python3 scripts/smoke_analytics_endpoint.py --url https://analytics.h2oatlas.ee`
- HTTP `200`
- body `ok`
- `Access-Control-Allow-Origin: https://h2oatlas.ee`

Live KV validation result:

- a manual `verify_page_open` POST returned HTTP `200`
- `event:last` was written in KV
- `events:2026-05-11:total` and
  `events:2026-05-11:verify_page_open` incremented remotely

## Required Cloudflare permissions

The deploy token must be able to:

- create/read Workers KV namespaces
- deploy Workers scripts
- optionally edit Pages environment variables if you want end-to-end activation

The original API token in `/home/anton/projects/.env` was insufficient for KV
namespace creation. Live activation was completed using the local Wrangler OAuth
profile under `/home/anton/.config/.wrangler/`.

## Activation steps

The current environment has already passed these steps:

1. Create two KV namespaces:
   - production `ANALYTICS_KV`
   - preview `ANALYTICS_KV_preview`
2. Replace placeholder IDs in `analytics-worker/wrangler.toml`.
3. Deploy the worker:
   - locally: `cd analytics-worker && npx wrangler deploy`
   - or via GitHub Actions: run `Analytics worker` with `deploy=true`
4. Smoke-test the deployed endpoint:

```bash
python3 scripts/smoke_analytics_endpoint.py --url https://<worker-url>
```

5. Set `NEXT_PUBLIC_ANALYTICS_ENDPOINT` in the frontend deployment
   environment.
6. Trigger a frontend rebuild/deploy so the public app starts sending events.

Concrete deployed values:

- production KV id: `b956856d9ca045e1a2cc58fb51598165`
- preview KV id: `2929154b206b4da89bf2809c1045608a`
- worker name: `h2oatlas-analytics`
- worker URL: `https://analytics.h2oatlas.ee`

## Completion criteria

- smoke script returns HTTP `200` and body `ok`
- browser network tab shows analytics POSTs from the live site
- `event:last` updates in KV after a manual verify-page open
- weekly review cadence is adopted for the collected counters

## Current remaining work

No repository or deployment blockers remain.

The remaining work is operational:

- observe real event flow from the live frontend after normal user traffic
- inspect KV counters after a manual `/verify` open and share flow
- adopt the weekly review cadence described in
  `docs/frontend_observability_and_cost.md`
- use `python3 scripts/review_analytics_kv.py --days 7` as the weekly review entrypoint
- use `python3 scripts/review_analytics_kv.py --days 7 --markdown` for a decision-ready review note
