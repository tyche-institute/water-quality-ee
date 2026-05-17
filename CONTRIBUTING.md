# Contributing to water-quality-ee / H2O Atlas

Thanks for considering a contribution. This project is a civic-tech tool built on Estonian Health Board (Terviseamet) open data — accuracy, transparency, and respectful framing matter as much as code quality.

## TL;DR

1. Open an issue first for anything non-trivial — saves your time and ours.
2. Fork, branch from `main`, keep PRs focused.
3. Run tests locally (`pytest tests/`) and `ruff check .` before pushing.
4. Be explicit about modelling assumptions; do not soften limitations.
5. By submitting a contribution, you agree it is licensed under Apache License 2.0 (see `LICENSE`).

## Ways to contribute

- **Bug reports.** Open a GitHub issue with: what you did, what you expected, what happened, environment (OS, Python version), and a minimal reproducer.
- **Data quality findings.** If you spot something in the Terviseamet feed that we have not handled (location renames, schema changes, threshold logic), file an issue with concrete examples — domain/year/`sid`.
- **Documentation.** Typos, clarifications, and translations are all welcome. The docs are in `docs/` and the citizen-service surface is in `frontend/`.
- **Features.** Open an issue describing the problem and proposed solution before writing code. Large changes without prior discussion are unlikely to merge cleanly.
- **Locale expansion.** The project currently targets Estonia. If you want to apply the same audit toolkit to a neighbouring country's open-data feed, please discuss in an issue first — we will help scope the fork.

## Development setup

```bash
git clone https://github.com/tyche-institute/water-quality-ee
cd water-quality-ee
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
pip install -e .          # editable install for src/ on sys.path
pytest tests/             # run the test suite
```

Frontend:

```bash
cd frontend
npm install
npm run dev               # http://localhost:3000
```

See `README.md` and `CLAUDE.md` for deeper context.

## Coding conventions

- **Python:** Ruff for lint (`ruff check . && ruff format --check .`). Type hints encouraged where they clarify intent; not required project-wide.
- **TypeScript / Next.js:** project uses Next 16, edge runtime where flagged. Match the existing style.
- **Notebooks:** edit the canonical `01…07_*.ipynb`. Do not commit `*_executed.ipynb` (already gitignored).
- **Imports:** prefer reusing utilities in `src/data_loader.py`, `src/features.py`, `src/evaluate.py`, `src/audit/`.
- **Commits:** Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`, etc.) with a short scope, e.g. `fix(frontend): correct chip alignment on iOS`.

## Testing

- Unit tests live in `tests/`.
- `pytest tests/ -x` for fail-fast.
- For data-loader changes, add a regression test against a small XML fixture rather than against the live feed.

## Modelling and framing

This project is unusually opinionated about what it claims:

- The model predicts **P(violation)** given a measurement profile — it does **not** predict water safety, future quality, or unmeasured contaminants. Maintain that framing in any code, docs, or UI surface you touch.
- Priority metric is **Recall on the violations class** (False Negatives are costly). Do not optimise for accuracy in isolation.
- When in doubt, read `docs/ml_framing.md` before opening a PR that touches models or thresholds.

## Reporting security issues

Do **not** open public issues for security problems. See `SECURITY.md`.

## Code of conduct

Be civil, specific, and patient. Discussions about Estonian regulatory norms, classification thresholds, and Terviseamet data quality are technical — keep them technical.

We do not have a separate CoC document; if a situation calls for one, open an issue.

## Licensing

By contributing, you agree your contribution is licensed under the [Apache License 2.0](LICENSE) and that the patent grant in Section 3 applies. See `NOTICE` for required attribution.
