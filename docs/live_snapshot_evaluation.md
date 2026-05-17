# Live Snapshot Evaluation

- Generated: `2026-05-11T19:59:54.229235Z`
- Snapshot generated_at: `2026-05-11T18:18:55.907630+00:00`
- Canonical model: `LightGBM`
- Places: **2204**

## Main takeaways

- Canonical live-slice metrics at threshold 0.5: AUC `0.995`, Recall₀ `0.964`, Precision₀ `0.784`.
- Recent-90d slice: AUC `0.993`, Recall₀ `0.984`, Precision₀ `0.732`.
- If we abstain on `high` uncertainty or missing model probability, coverage remains `98.5%` with retained-slice AUC `0.999`.

## Per-domain metrics

| Domain | n | violation rate | AUC | Recall₀ | Precision₀ | Brier |
|---|---:|---:|---:|---:|---:|---:|
| `basseinid` | 622 | 16.4% | 0.992 | 0.990 | 0.777 | 0.039 |
| `joogivesi` | 68 | 16.2% | 0.978 | 0.909 | 0.833 | 0.049 |
| `supluskoha` | 186 | 4.8% | 0.999 | 0.889 | 0.889 | 0.009 |
| `veevark` | 1328 | 3.5% | 0.996 | 0.936 | 0.772 | 0.011 |

## Hard-case slices

| Slice | n | AUC | Recall₀ | Precision₀ |
|---|---:|---:|---:|---:|
| High-uncertainty slice | 33 | n/a | 0.848 | 1.000 |
| Hidden-violation slice | 33 | n/a | 0.848 | 1.000 |
| Hidden-pass slice | 174 | n/a | 0.000 | 0.000 |
| Sparse published coverage | 947 | 0.989 | 0.909 | 0.882 |
| Low-uncertainty slice | 1079 | 0.999 | 0.991 | 0.820 |

## Abstention proposal

- `abstain`: no model probability, or `uncertainty_level = high`
- `caution`: `uncertainty_level = medium` or sparse published coverage
- `normal`: `uncertainty_level = low`

This policy does not suppress the official status. It limits how strongly the ML score should be interpreted when the published basis is weak.

## Calibration by domain

Quantile-bin calibration tables are stored in `data/processed/live_snapshot_evaluation.json` under `calibration_by_domain`.
