# Frontend Data Contract

Machine-readable contract: `docs/data_ml_contract.json`

Validator: `scripts/check_data_ml_contracts.py`

Экспортёр: `citizen-service/scripts/export_frontend_snapshot.py`

Артефакты:

- `frontend/public/data/snapshot.frontend.json` — основной payload для dashboard.
- `frontend/public/data/snapshot.history.json` — отдельная карта `place_id -> sample_history[]` для lazy load.
- `frontend/public/data/snapshot.details.json` — отдельная карта `place_id -> { measurements }` для lazy detail load.
- `frontend/public/data/og-index.json` — облегчённый индекс для metadata / social preview.

Источник: `citizen-service/artifacts/snapshot.json`.

## `snapshot.frontend.json`

### Root fields

- `generated_at: string`
- `data_fetched_at?: string | null`
- `model_trained_at?: string | null`
- `has_model_predictions: boolean`
- `available_models: string[]`
- `model_labels: Record<string, string>`
- `canonical_model?: string | null`
- `data_catalog_url: string | null`
- `disclaimer: string | null`
- `places_count: number`
- `place_kinds: Record<string, string>`
- `domains: string[]`
- `diagnostics.official_compliant_share: number | null`
- `diagnostics.official_violation_share: number | null`
- `diagnostics.model_coverage_share: number`
- `diagnostics.mean_model_probabilities: Record<string, number | null>`
- `diagnostics.uncertainty_summary?: { method, audit_bucket_counts, uncertainty_level_counts, places_with_publication_gap, flag_counts }`
- `places: FrontendPlace[]`
- `refresh_history: RefreshHistoryEntry[]`
- `model_version?: string`
- `git_sha?: string | null`
- `feature_hash_columns?: string[]`

### `FrontendPlace`

- `id: string`
- `location: string`
- `domain: string`
- `place_kind: string`
- `county: string | null`
- `sample_date: string | null`
- `official_compliant: number | null` (`1 | 0 | null`)
- `coord_source: string | null`
- `lat: number`
- `lon: number`
- `model_violation_prob: number | null`
- `lr_violation_prob: number | null`
- `rf_violation_prob: number | null`
- `gb_violation_prob: number | null`
- `lgbm_violation_prob: number | null`
- `risk_level: "low" | "medium" | "high" | "unknown"`
- `has_model_prob: boolean`
- `audit_bucket: "agree_pass" | "agree_violate" | "hidden_violation" | "hidden_pass" | "unknown"`
- `deterministic_norms_violation: boolean`
- `n_measured_norm_params: number`
- `n_total_norm_params: number`
- `norm_coverage_ratio: number | null`
- `data_quality_flags: string[]`
- `uncertainty_level: "low" | "medium" | "high"`
- `search_text: string`
- `measurements_count: number`
- `prediction_id?: string`
- `feature_hash?: string`
- `model_version?: string`
- `created_at?: string`

Примечание:

- `measurements` в основном payload больше не гарантируются; измерения отделены в `snapshot.details.json`, чтобы уменьшить initial load.
- `sample_history` в основном payload больше не гарантируется; история отделена в `snapshot.history.json`, чтобы уменьшить initial load.

## `snapshot.history.json`

Формат:

- `Record<string, SampleHistoryEntry[]>`
- ключ: `FrontendPlace.id`
- значение: массив не более 12 последних записей для UI

### `SampleHistoryEntry`

- `sample_date: string`
- `official_compliant: number | null`
- `measurements?: Record<string, number>`

## `snapshot.details.json`

Формат:

- `Record<string, PlaceDetailsEntry>`
- ключ: `FrontendPlace.id`

### `PlaceDetailsEntry`

- `measurements?: Record<string, number>`

## `og-index.json`

Формат:

- `places: Record<string, { name: string; county: string | null; risk_level: string; status: string }>`

Использование:

- `app/page.tsx` для per-place Open Graph metadata
- OG worker для генерации social preview images
- `sitemap.ts` для ранжирования интересных точек

## Risk bucketing

Задаётся в экспортёре:

- `high`: `prob >= 0.7`
- `medium`: `0.4 <= prob < 0.7`
- `low`: `prob < 0.4`
- `unknown`: вероятность отсутствует

## Uncertainty / publication-gap layer

These fields surface a narrow deterministic audit against the published parameters:

- `audit_bucket` compares the official label to the deterministic norm checker.
- `hidden_violation` means the official label is `violation`, but the published parameters alone do not reproduce that verdict.
- `hidden_pass` means the published parameters exceed a checked norm while the official label remains compliant.
- `data_quality_flags` adds user-facing machine-readable caveats such as sparse published parameter coverage.
- `uncertainty_level` is a UI-facing severity tier derived from `audit_bucket` and parameter coverage, not from model confidence.

## Refresh history

Rolling snapshot-level history kept directly in `snapshot.frontend.json`:

- `generated_at: string | null`
- `data_fetched_at?: string | null`
- `model_trained_at?: string | null`
- `git_sha?: string | null`
- `model_version?: string | null`
- `places_count: number`
- `official_violation_share: number | null`
- `model_coverage_share: number`
- `publication_gap_count: number`
- `changes_from_previous?: { places_count_delta, official_violation_share_delta_pp, model_coverage_share_delta_pp, publication_gap_count_delta } | null`

Purpose:

- power a user-visible “what changed since previous refresh” summary near the map trust overlay;
- preserve a short rolling audit trail across refreshes instead of showing only the latest timestamps.
