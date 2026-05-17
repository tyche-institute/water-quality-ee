"use client";

import { useEffect, useMemo, useState } from "react";
import VerifyResultCard from "./VerifyResultCard";
import { useVerifyWorkflow } from "./use-verify-workflow";
import { VERIFY_COPY } from "./verify-copy";
import { formatLocalizedCount } from "../lib/dashboard-utils";

type PublishedSnapshot = {
  generated_at?: string;
  data_fetched_at?: string | null;
  model_trained_at?: string | null;
  canonical_model?: string | null;
  model_version?: string | null;
  git_sha?: string | null;
  places_count?: number;
  refresh_history?: Array<{
    generated_at?: string | null;
    git_sha?: string | null;
    places_count?: number;
    publication_gap_count?: number;
  }>;
};

type SignatureSidecar = {
  mode?: string;
  signed_at?: string;
  aletheia_uuid?: string;
  tsa_token_included?: boolean;
};

function VerifyHeroIcon({ kind }: { kind: "ok" | "integrity" | "fail" }) {
  if (kind === "ok") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17Zm-1 11.2-3-3 1.4-1.4 1.6 1.6 3.8-3.8 1.4 1.4-5.2 5.2Z" fill="currentColor" />
      </svg>
    );
  }
  if (kind === "integrity") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3 5 6v5c0 4.5 2.9 7.6 7 9 4.1-1.4 7-4.5 7-9V6l-7-3Zm0 4.2a2 2 0 1 1 0 4 2 2 0 0 1 0-4Zm0 9.2c-1.7 0-3.2-.7-4.2-1.9.4-1.5 1.8-2.5 3.5-2.5h1.4c1.7 0 3.1 1 3.5 2.5-1 1.2-2.5 1.9-4.2 1.9Z" fill="currentColor" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3 2.2 20h19.6L12 3Zm0 5.2c.6 0 1 .4 1 1v5.4a1 1 0 1 1-2 0V9.2c0-.6.4-1 1-1Zm0 10a1.2 1.2 0 1 1 0-2.4 1.2 1.2 0 0 1 0 2.4Z" fill="currentColor" />
    </svg>
  );
}

function formatDateTime(value: string | null | undefined, lang: "ru" | "et" | "en") {
  if (!value) return "—";
  try {
    const locale = lang === "ru" ? "ru-RU" : lang === "et" ? "et-EE" : "en-GB";
    return new Intl.DateTimeFormat(locale, {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Europe/Tallinn",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export default function VerifyPageClient() {
  const { lang, busy, result, fileName, onFile, onVerifyLive } = useVerifyWorkflow();
  const t = VERIFY_COPY[lang];
  const [snapshot, setSnapshot] = useState<PublishedSnapshot | null>(null);
  const [signature, setSignature] = useState<SignatureSidecar | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadPublishedMeta() {
      try {
        const [snapshotResponse, signatureResponse] = await Promise.all([
          fetch("/data/snapshot.frontend.json", { cache: "no-store" }),
          fetch("/data/snapshot.sig.json", { cache: "no-store" }),
        ]);

        const [snapshotJson, signatureJson] = await Promise.all([
          snapshotResponse.ok ? snapshotResponse.json() : null,
          signatureResponse.ok ? signatureResponse.json() : null,
        ]);

        if (!cancelled) {
          setSnapshot(snapshotJson);
          setSignature(signatureJson);
        }
      } catch {
        if (!cancelled) {
          setSnapshot(null);
          setSignature(null);
        }
      }
    }

    void loadPublishedMeta();
    return () => {
      cancelled = true;
    };
  }, []);

  const history = useMemo(() => (snapshot?.refresh_history || []).slice(0, 4), [snapshot?.refresh_history]);

  return (
    <main className="page verifyPage">
      <section className="panel verifyHero">
        <div className="verifyHeroCopy">
          <p className="verifyEyebrow">{t.eyebrow}</p>
          <h1 className="title verifyTitle">{t.title}</h1>
          <p className="subtitle verifyIntro">{t.intro}</p>
        </div>
        <div className="verifyTrustCard">
          <div className="verifyTrustCardTop">
            <span className={`badge ${signature?.signed_at ? "good" : "warn"}`}>
              {signature?.signed_at ? t.summarySigned : t.summaryUnsigned}
            </span>
            {signature?.signed_at ? <span className="verifyTrustTimestamp">{formatDateTime(signature.signed_at, lang)}</span> : null}
          </div>
          <strong>{t.trustCardTitle}</strong>
          <p>{t.trustCardBody}</p>
        </div>
      </section>

      <section className="verifyPrimaryGrid">
        <section className="panel verifyActionPanel">
          <div className="verifySectionHeader">
            <h2>{t.actionTitle}</h2>
            <p className="hint">{t.actionHint}</p>
          </div>

          <div className="verifyActionStack">
            <div className="verifyActionCard verifyActionCardPrimary">
              <div className="verifyActionHeading">
                <strong>{t.verifyLiveTitle}</strong>
              </div>
              <p className="hint verifyActionCardHint">{t.liveHint}</p>
              <button type="button" className="btn verifyActionBtn" onClick={() => void onVerifyLive()}>
                {t.verifyLive}
              </button>
            </div>

            <div
              className="verifyDropzone"
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                const file = event.dataTransfer.files?.[0];
                if (file) void onFile(file);
              }}
            >
              <label className="verifyFileLabel">
                <strong>{t.uploadTitle}</strong>
                <span className="hint">{t.uploadHint}</span>
                <span className="verifyDropLabel">{t.dropLabel}</span>
                <span className="hint">{t.fileHint}</span>
                <input
                  className="verifyFileInput"
                  type="file"
                  accept=".aep,application/zip,application/octet-stream"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) void onFile(file);
                  }}
                />
              </label>
              {fileName ? (
                <div className="verifySelectedFile">
                  <span className="badge warn">{t.fileSelectedLabel}</span>
                  <code>{fileName}</code>
                </div>
              ) : null}
            </div>
          </div>
        </section>
      </section>

      <section className="panel verifyTransparencyPanel">
        <div className="verifySectionHeader">
          <h2>{t.transparencyTitle}</h2>
          <p className="hint">{t.transparencyHint}</p>
        </div>
        <div className="verifyHeroMeta" aria-label={t.levelsTitle}>
          <div className="verifyMetaCard verifyMetaCardOk">
            <span className="verifyMetaCardIcon"><VerifyHeroIcon kind="ok" /></span>
            <div>
              <strong>{t.transparencySignedTitle}</strong>
              <p>{t.transparencySignedBody}</p>
            </div>
          </div>
          <div className="verifyMetaCard">
            <span className="verifyMetaCardIcon"><VerifyHeroIcon kind="integrity" /></span>
            <div>
              <strong>{t.transparencyBrowserTitle}</strong>
              <p>{t.transparencyBrowserBody}</p>
            </div>
          </div>
          <div className="verifyMetaCard verifyMetaCardAudit">
            <span className="verifyMetaCardIcon"><VerifyHeroIcon kind="integrity" /></span>
            <div>
              <strong>{t.transparencyAuditTitle}</strong>
              <p>{t.transparencyAuditBody}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="verifyGrid">
        <aside className="panel verifyGuidePanel">
          <div className="verifySectionHeader">
            <h2>{t.levelsTitle}</h2>
            <p className="hint">{t.levelsHint}</p>
          </div>
          <ul className="verifyGuideList">
            <li><strong>{t.okBadge}</strong>: {t.levelsSignature}</li>
            <li><strong>{t.integrityBadge}</strong>: {t.levelsIntegrity}</li>
            <li><strong>{t.failBadge}</strong>: {t.levelsFailure}</li>
          </ul>
        </aside>

        <section className="panel verifyResultPanel" aria-live="polite">
          <div className="verifySectionHeader">
            <h2>{t.resultTitle}</h2>
            {fileName && !busy ? <p className="hint">{t.useFile}: <code>{fileName}</code></p> : <p className="hint">{t.resultHint}</p>}
          </div>
          {busy ? <p className="hint">{t.waiting}</p> : null}
          {result ? (
            <VerifyResultCard lang={lang} result={result} />
          ) : !busy ? (
            <div className="verifyResultEmpty">
              <strong>{t.resultEmptyTitle}</strong>
              <p>{t.resultEmptyHint}</p>
            </div>
          ) : null}
        </section>
      </section>

      <section className="panel verifySnapshotPanel">
        <div className="verifySectionHeader">
          <h2>{t.publishedTitle}</h2>
          <p className="hint">{t.publishedHint}</p>
        </div>
        <div className="verifySnapshotCard">
          <dl className="verifySnapshotMeta">
            <dt>{t.snapshotLabel}</dt>
            <dd>{formatDateTime(snapshot?.generated_at, lang)}</dd>
            <dt>{t.dataLabel}</dt>
            <dd>{formatDateTime(snapshot?.data_fetched_at, lang)}</dd>
            <dt>{t.modelLabel}</dt>
            <dd>{formatDateTime(snapshot?.model_trained_at, lang)}</dd>
            <dt>{t.currentModelLabel}</dt>
            <dd>{snapshot?.canonical_model || snapshot?.model_version || "—"}</dd>
            <dt>{t.pointsLabel}</dt>
            <dd>{typeof snapshot?.places_count === "number" ? snapshot.places_count.toLocaleString(lang === "ru" ? "ru-RU" : lang === "et" ? "et-EE" : "en-GB") : "—"}</dd>
            <dt>{t.commitLabel}</dt>
            <dd className="verifyMetaCode">{snapshot?.git_sha || "—"}</dd>
            <dt>{t.signedAt}</dt>
            <dd>{formatDateTime(signature?.signed_at, lang)}</dd>
            <dt>{t.signedModeLabel}</dt>
            <dd>{signature?.mode || "—"}</dd>
            <dt>{t.tsaLabel}</dt>
            <dd>{signature?.tsa_token_included ? "✓" : "—"}</dd>
            <dt>{t.aletheiaUuid}</dt>
            <dd className="verifyMetaCode">{signature?.aletheia_uuid || "—"}</dd>
          </dl>

          <div className="verifyHistoryCard">
            <div className="verifyHistoryTitle">{t.historyTitle}</div>
            {history.length ? (
              <div className="verifyHistoryList">
                {history.map((entry, index) => (
                  <div key={`${entry.generated_at ?? "unknown"}-${index}`} className="verifyHistoryItem">
                    <div className="verifyHistoryTime">{formatDateTime(entry.generated_at, lang)}</div>
                    <div className="verifyHistoryMeta">
                      {entry.git_sha ? `#${entry.git_sha.slice(0, 7)}` : "—"}
                      {typeof entry.places_count === "number" ? ` · ${entry.places_count}` : ""}
                      {typeof entry.publication_gap_count === "number"
                        ? ` · ${formatLocalizedCount(lang, entry.publication_gap_count, {
                            ru: ["скрытое нарушение", "скрытых нарушения", "скрытых нарушений"],
                            et: ["peidetud rikkumine", "peidetud rikkumist"],
                            en: ["hidden violation", "hidden violations"],
                          })}`
                        : ""}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="hint">{t.historyEmpty}</p>
            )}
          </div>
        </div>
      </section>

      <p className="verifyFootnote">
        <a
          href="https://github.com/tyche-institute/water-quality-ee/blob/main/docs/key_management.md"
          target="_blank"
          rel="noreferrer"
        >
          {t.more}
        </a>
      </p>
    </main>
  );
}
