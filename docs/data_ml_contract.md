# Data/ML Contract

Machine-readable contract: `docs/data_ml_contract.json`

Validator: `scripts/check_data_ml_contracts.py`

Назначение:

- зафиксировать production contract между `citizen-service/artifacts/snapshot.json` и frontend-артефактами;
- проверить, что split payload не ломает lazy-loaded assets;
- удерживать provenance/model metadata синхронизированными между source snapshot и frontend export;
- сделать release-gate для data/ML части таким же строгим, как уже сделан для trust-claims.

Проверяется автоматически:

- обязательные root-поля `snapshot.frontend.json`;
- обязательные per-place поля frontend snapshot;
- отсутствие `measurements` и `sample_history` в основном payload;
- наличие и валидность `snapshot.history.json` и `snapshot.details.json`;
- согласованность `places_count`, `place ids`, `available_models`, `model_version`, `git_sha`, `feature_hash_columns`;
- наличие per-place provenance полей там, где snapshot уже публикует model metadata;
- ограничение истории для UI: не более 12 записей на place.

Этот контракт описывает production artefacts, а не research pipeline в целом. Если schema экспорта меняется, сначала обновляется `docs/data_ml_contract.json`, затем экспортёр, тесты и release-gates.
