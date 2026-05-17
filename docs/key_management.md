# Key management for signed snapshots

> **Context.** Phase 3 of the AI Act compliance roadmap signs each
> `snapshot.json` into a `.aep` evidence package. Signing is delegated to the
> Aletheia backend (`api.eatf.eu`, hosted on Hetzner — replaces the legacy
> `eatf.duckdns.org` deployment retired in May 2026). The backend signs with
> ML-DSA-65 (post-quantum) plus a legacy RSA-4096 leg for backward
> compatibility. A local fallback signer using self-signed RSA-4096 keys
> exists for development and for the backend downtime window. This file
> documents how those keys are managed, rotated, and handled in an incident.

## 1. Key material in use

| Role | Where | Algorithm | Lifetime |
|---|---|---|---|
| **Backend signing key (primary)** | Aletheia backend (Hetzner, `api.eatf.eu`) | ML-DSA-65 (post-quantum, FIPS 204) | Until rotation event |
| **Backend signing key (legacy leg)** | Same backend | RSA-4096 + SHA-256 (PSS) — kept for verifiers that pre-date PQC support | Until rotation event |
| **Backend certificate** | Issued by Aletheia's internal CA / self-signed (Phase 3) | X.509 v3 | 12 months |
| **Local dev key** | `data/keys/sign_private.pem` (gitignored, auto-generated on first run of `sign_snapshot.py --mode local`) | RSA-4096 + SHA-256 | 12 months (cert `not_after`) |
| **Public verifier key (official bundles)** | Embedded as `public_key.pem` inside the downloaded Aletheia evidence package | RSA public key PEM | Rotates with backend signer |

The project deliberately does **not** own the private trust anchor. The backend owns the signing key; this repository publishes the verifier and, for official backend evidence packages, distributes the matching public key inside each `.aep` bundle.

## 2. Locations checked into git

- `frontend/public/data/snapshot.aep` — the published evidence package users verify.
- `frontend/public/data/snapshot.sig.json` — lightweight metadata sidecar for trust badges and freshness UI.

**Never commit** a private key. `.gitignore` includes `data/keys/` explicitly; CI secret injection uses `ALETHEIA_LOCAL_KEY_PATH` pointing at a runner-local path.

## 3. GitHub Actions secrets

| Secret name | Content | Used by |
|---|---|---|
| `ALETHEIA_BACKEND_URL` | `https://api.eatf.eu` (no trailing slash) | `scripts/sign_snapshot.py` in the citizen-snapshot workflow |
| `ALETHEIA_API_KEY` | Bearer token for the `POST /api/sign` endpoint | same |
| `ALETHEIA_LOCAL_KEY` | PEM-encoded RSA private key (only for fallback runs) | written to a tmpfile by the workflow; deleted at step end |
| `ALETHEIA_LOCAL_CERT` | Matching X.509 cert PEM | same |

Secrets are scoped to the `citizen-snapshot` environment and not exposed to other workflows.

## 4. Rotation policy

### Backend key

Rotate annually, or immediately after any suspected compromise, or whenever the backend host changes (e.g. the Hetzner migration).

**Procedure:**

1. Aletheia backend generates a new RSA-4096 key and issues a new X.509 certificate.
2. No frontend key rotation PR is required for official evidence bundles: the current public key is embedded into each downloaded `.aep` as `public_key.pem`.
3. Merge the backend rotation change and let the snapshot workflow publish a fresh `.aep`.
4. Merge; CI rebuilds and deploys the frontend.
5. New snapshots are signed with the new key; old snapshots remain verifiable because each historical `.aep` already carries its own verification material.

### Local dev key

Rotate when `data/keys/sign_cert.pem` nears `not_after`. Delete both files and re-run `sign_snapshot.py` — a fresh dev cert is generated automatically. Dev certs are never installed as trust anchors on the live frontend.

## 5. Storage

| Material | Storage |
|---|---|
| Backend private key | Aletheia backend HSM / encrypted filesystem; never exits the backend |
| Backend certificate / public key | Distributed inside the official evidence package (`public_key.pem`) |
| Local dev private key | `data/keys/sign_private.pem` — chmod 600; gitignored |
| GitHub Actions secrets | GitHub-encrypted, scoped to the `citizen-snapshot` environment |
## 6. Incident response

Trigger: any of the following —

- A published `.aep` fails local verification when the snapshot content is believed genuine.
- `ALETHEIA_BACKEND_URL` returns invalid signatures or truncated bundles.
- Suspicion or disclosure that `ALETHEIA_LOCAL_KEY` was exposed in a public log.

**Steps:**

1. **Freeze publication.** Disable the citizen-snapshot workflow via the GitHub Actions UI.
2. **Pull the affected artefact.** Remove the signed `.aep` from the frontend CDN cache (via the deploy pipeline's "invalidate" action) and tag the corresponding git commit as `COMPROMISED-YYYY-MM-DD`.
3. **Rotate.** Issue a new backend certificate (see §4), revoke the old one via the internal CA's revocation mechanism.
4. **Post-mortem.** Open a public issue describing what happened, which snapshots are affected, and how verification now works. Link from the `/verify` page.
5. **Restore publication.** Once a new key is in place and at least one fresh snapshot has been signed and verified, re-enable the workflow.

Do **not** publish retroactive "back-signed" snapshots; the point of the evidence chain is that a signature at time T proves the state at time T.

## 7. Verifier trust model

The `/verify` page now supports three bundle families:

- **Official backend evidence package.** Produced by `GET /api/ai/evidence/{id}?format=zip` after `POST /api/sign`. The browser recomputes `SHA-256(canonical.bin)`, verifies the RSA signature against the embedded `public_key.pem`, and checks that `timestamp.tsr` is present. This is the preferred release path.
- **Legacy backend self-bundled snapshot package.** Older bundles published before the evidence-download path was wired still verify only the integrity chain (`payload.json -> signed_manifest.json -> manifest.json`) and are not fully signature-verified in the browser.
- **Local dev bundle.** Verified fully in-browser against the embedded SPKI key material.

User-facing copy must distinguish the official backend evidence package from the legacy backend snapshot bundle. The legacy backend format remains integrity-only.
do not describe backend verification as full cryptographic signature validation when the bundle is the legacy self-bundled snapshot format.

## 8. Out of scope for this document

- Key management practices internal to the Aletheia backend (documented in the `aletheia-ai` repository).
- OCSP responder / CRL distribution points — not deployed yet; timestamp chain presence is checked, but full RFC 3161 chain validation still belongs to the production verifier toolchain.
- HSM / cloud KMS integration.

## 9. Change log

| Date | Change |
|---|---|
| 2026-04-20 | Initial document; covers local_dev signer and Aletheia backend HTTP client. |
