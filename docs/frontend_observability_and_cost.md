# Frontend Observability and Cost Strategy

## Current instrumentation

- Client events via `sendBeacon` in `frontend/app/lib/analytics.ts`.
- Events:
  - `dashboard_open`
  - `filters_changed`
  - `place_selected`
  - `watchlist_toggled`
  - `history_toggled`
  - `measurements_toggled`
  - `info_opened`
  - `share_click`
  - `verify_page_open`
  - `verify_attempt`
  - `verify_result`
  - `data_gap_notice_impression`
  - `data_gap_notice_dismissed`
  - `signed_badge_click`
  - `web_vital`

Set `NEXT_PUBLIC_ANALYTICS_ENDPOINT` to enable event delivery.

## Product-useful slices

- Acquisition / activation:
  - dashboard opens
  - place selection after search / filter usage
- Trust:
  - verify-page opens
  - verify attempts / success rate
  - signed-badge clicks
  - data-gap notice impressions / dismissals
- Engagement:
  - history opens
  - measurements opens
  - share clicks
  - watchlist toggles
- Runtime quality:
  - web vitals
  - snapshot fetch / verification failures at the endpoint layer

## Recommended Cloudflare endpoint

- Use a lightweight Worker endpoint for ingestion.
- Store counters/aggregates in Workers KV or forward to external analytics.
- Keep payload small (event name + timestamp + compact metadata).
- Concrete repo package: `analytics-worker/`
- Legacy minimal example: `docs/cloudflare_worker_analytics_example.js`

## Cost posture

- Phase now: Cloudflare Pages Free + static snapshot JSON.
- Optional Worker Free: up to 100k requests/day for basic telemetry.
- Scale-up trigger: sustained traffic or need for richer API -> Workers Paid ($5/month base).

## Decision gates for paid plan

Move to paid when one or more conditions hold:

1. Daily requests approach free caps.
2. Need for server-side personalization or complex API aggregation.
3. Need longer retention/advanced observability pipeline.

## Repo status

The repository now includes:

- frontend event emitter: `frontend/app/lib/analytics.ts`
- event strategy doc: this file
- deployable ingestion endpoint: `analytics-worker/`
- smoke script: `scripts/smoke_analytics_endpoint.py`
- review helper: `scripts/review_analytics_kv.py`
- live analytics worker: `https://analytics.h2oatlas.ee`
- activation runbook: `docs/ANALYTICS_ACTIVATION.md`

Activation status:

- KV namespaces are created and bound.
- The worker is deployed on the custom domain.
- `NEXT_PUBLIC_ANALYTICS_ENDPOINT` is configured in Pages preview and
  production.
- A production Pages rebuild was triggered after the env update.

What remains operational, not coding work:

- confirm real event flow from live user sessions
- inspect `event:last` and daily counters in KV during initial rollout
- adopt a weekly review cadence for the collected counters

Suggested operator command:

```bash
python3 scripts/review_analytics_kv.py --days 7
```

Suggested weekly-review format:

```bash
python3 scripts/review_analytics_kv.py --days 7 --markdown
```
