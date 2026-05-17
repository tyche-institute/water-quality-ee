# Frontend (Next.js + Cloudflare Pages)

Новый публичный UI для citizen-service с упором на скорость, UX и контроль дизайна.

## Быстрый старт

```bash
cd frontend
npm install
npm run dev
```

Перед запуском убедитесь, что существует `public/data/snapshot.frontend.json`:

```bash
python3 citizen-service/scripts/export_frontend_snapshot.py
```

## Скрипты

- `npm run dev` — локальная разработка.
- `npm run build` — production-сборка.
- `npm run start` — запуск production-сервера.
- `npm run lint` — ESLint.
- `npm run typecheck` — TypeScript type-check.

## Деплой в Cloudflare Pages

1. Root directory: `frontend`
2. Build command: `npm run build && npx @cloudflare/next-on-pages@1`
3. Output directory: `.vercel/output/static`
4. Node version: 20+

Подробный чеклист: `frontend/DEPLOY_CLOUDFLARE.md`.

## Analytics / observability

Если задан `NEXT_PUBLIC_ANALYTICS_ENDPOINT`, фронтенд отправляет события через `sendBeacon`:
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

Это можно направить в Cloudflare Worker endpoint.

## Trust contract

- Frontend больше не хранит собственную копию нормативов в компонентах.
- Машиночитаемый reference-файл: `frontend/app/lib/water-rules.json`.
- Frontend использует его через `app/lib/water-rules.ts`.
- CI-проверка `python scripts/check_water_norms_sync.py` валит билд при drift между `src/features.py` и frontend reference.

## GitHub Actions

- `Citizen snapshot` автоматически экспортирует `frontend/public/data/snapshot.frontend.json`.
- `Frontend CI` проверяет `lint + typecheck + build`.
- `Site smoke` ежедневно и вручную проверяет `https://h2oatlas.ee` через `scripts/smoke_live_site.py`.
- `Deploy Frontend to Cloudflare Pages` деплоит `main` в Cloudflare Pages (нужны secrets).

## Release verification

- Полный локальный release gate из корня репозитория: `./scripts/verify_release.sh`
- Локальный Playwright UI/UX review production-сборки: `npm run ui:review`
  - по умолчанию проверяет `http://127.0.0.1:3000`, сохраняет скриншоты и JSON-отчёт в `/tmp/h2oatlas-ui-review`
  - для другого URL: `H2O_UI_REVIEW_BASE_URL=https://h2oatlas.ee npm run ui:review`
- Live smoke для прод-сайта: `python3 scripts/smoke_live_site.py --base-url https://h2oatlas.ee`
- Browser live smoke после Cloudflare deploy: `npm run ux:smoke:live`
  - wrapper запускает `scripts/ux-smoke.mjs` против `https://h2oatlas.ee`
  - по умолчанию делает 3 попытки, чтобы пережить короткую propagation-зону Pages assets
- GitHub Actions используют тот же gate выборочно:
  - `./scripts/verify_release.sh --skip-python` для `Frontend CI`
  - `./scripts/verify_release.sh --skip-frontend` для Python `tests`

## Current architecture

- `app/components/Dashboard.tsx` — тонкий composition root.
- `app/lib/use-dashboard-controller.ts` — orchestration/controller layer, собирающий state, derived data, actions и prop-packets.
- `app/components/DashboardTopChrome.tsx` — header, mobile controls, stats row, sidebar/drawer.
- `app/components/DashboardMainContent.tsx` — map shell, selected-place desktop panel, mobile bottom sheet, reports, places table.
- `app/components/DashboardOverlays.tsx` — info page, info modal, toast/freshness/count overlays.

Это разделение нужно сохранять: новые UI-фичи должны попадать в bounded component/hook слой, а не возвращать `Dashboard` к состоянию render-monolith.
