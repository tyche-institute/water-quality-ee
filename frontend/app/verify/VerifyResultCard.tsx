"use client";

import type { VerifyResult } from "./aep";
import type { UiLang } from "./verify-copy";
import { VERIFY_COPY } from "./verify-copy";

type Props = {
  lang: UiLang;
  result: VerifyResult;
};

export default function VerifyResultCard({ lang, result }: Props) {
  const t = VERIFY_COPY[lang];
  const successBadge = result.verificationLevel === "integrity" ? t.integrityBadge : t.okBadge;
  const cardStateClass = result.ok
    ? result.verificationLevel === "integrity"
      ? "integrity"
      : "ok"
    : "fail";

  return (
    <div
      role="status"
      className={`verifyResultCard ${cardStateClass}`}
    >
      <strong>{result.ok ? successBadge : t.failBadge}</strong>
      <div className="verifyResultReason">{result.reason}</div>
      {result.manifest && (
        <dl className="verifyResultMeta">
          <dt>{t.signedAt}</dt>
          <dd>{String(result.manifest.signed_at ?? "")}</dd>
          <dt>{t.algorithm}</dt>
          <dd>{String(result.manifest.algorithm ?? "")}</dd>
          {(result.manifest.pqc_signature_included !== undefined || Boolean(result.manifest.pqc_algorithm)) && (
            <>
              <dt>{t.postQuantum}</dt>
              <dd className={result.manifest.pqc_signature_included ? "verifyMetaSuccess" : "verifyMetaMuted"}>
                {result.manifest.pqc_signature_included ? t.postQuantumIncluded : t.postQuantumNotIncluded}
              </dd>
            </>
          )}
          {result.manifest.rsa_legacy_signature_included !== undefined && (
            <>
              <dt>{t.rsaLegacy}</dt>
              <dd className="verifyMetaMuted">
                {result.manifest.rsa_legacy_signature_included ? "✓" : "—"}
              </dd>
            </>
          )}
          <dt>{t.mode}</dt>
          <dd>{String(result.manifest.mode ?? "")}</dd>
          {Boolean(result.manifest.agent_id) && (
            <>
              <dt>{t.agent}</dt>
              <dd className="verifyMetaCode">
                {String(result.manifest.agent_id)}
              </dd>
            </>
          )}
          {Boolean(result.manifest.aletheia_uuid) && (
            <>
              <dt>{t.aletheiaUuid}</dt>
              <dd className="verifyMetaCode">
                {String(result.manifest.aletheia_uuid)}
              </dd>
            </>
          )}
          {result.payloadDigest && (
            <>
              <dt>{t.digest}</dt>
              <dd className="verifyMetaCode">
                {result.payloadDigest}
              </dd>
            </>
          )}
        </dl>
      )}
    </div>
  );
}
