"use client";

import { TRUST_COPY } from "../lib/trust-copy";

export type UiLang = "ru" | "et" | "en";

export const VERIFY_COPY: Record<
  UiLang,
  {
    title: string;
    eyebrow: string;
    intro: string;
    trustCardTitle: string;
    trustCardBody: string;
    publishedTitle: string;
    publishedHint: string;
    snapshotLabel: string;
    dataLabel: string;
    modelLabel: string;
    currentModelLabel: string;
    pointsLabel: string;
    commitLabel: string;
    signedModeLabel: string;
    tsaLabel: string;
    historyTitle: string;
    historyEmpty: string;
    summarySigned: string;
    summaryUnsigned: string;
    actionTitle: string;
    actionHint: string;
    liveRecommended: string;
    fileSelectedLabel: string;
    dropLabel: string;
    fileHint: string;
    verifyLive: string;
    liveHint: string;
    verifyLiveTitle: string;
    uploadTitle: string;
    uploadHint: string;
    waiting: string;
    resultTitle: string;
    resultHint: string;
    resultEmptyTitle: string;
    resultEmptyHint: string;
    levelsTitle: string;
    levelsHint: string;
    heroSignatureHint: string;
    heroIntegrityHint: string;
    heroFailureHint: string;
    levelsSignature: string;
    levelsIntegrity: string;
    levelsFailure: string;
    transparencyTitle: string;
    transparencyHint: string;
    transparencySignedTitle: string;
    transparencySignedBody: string;
    transparencyBrowserTitle: string;
    transparencyBrowserBody: string;
    transparencyAuditTitle: string;
    transparencyAuditBody: string;
    signedAt: string;
    algorithm: string;
    digest: string;
    mode: string;
    okBadge: string;
    integrityBadge: string;
    failBadge: string;
    more: string;
    noFile: string;
    useFile: string;
    postQuantum: string;
    postQuantumIncluded: string;
    postQuantumNotIncluded: string;
    rsaLegacy: string;
    agent: string;
    aletheiaUuid: string;
  }
> = {
  ru: {
    title: "Проверка снимка",
    eyebrow: "Проверяемое происхождение",
    intro: TRUST_COPY.ru.verifyIntro,
    trustCardTitle: "Опубликованный снимок подписан",
    trustCardBody: "Карта показывает только badge подписи. Здесь можно увидеть, когда был выпущен снимок, на каких данных и модели он основан, и затем перепроверить сам пакет.",
    publishedTitle: "Опубликованный snapshot",
    publishedHint: "Техническое приложение: что именно сейчас опубликовано на h2oatlas.ee.",
    snapshotLabel: "Снимок собран",
    dataLabel: "Данные получены",
    modelLabel: "Модель обучена",
    currentModelLabel: "Текущая модель",
    pointsLabel: "Точек на карте",
    commitLabel: "Git SHA",
    signedModeLabel: "Режим подписания",
    tsaLabel: "TSA timestamp",
    historyTitle: "История refresh",
    historyEmpty: "История появится после следующего обновления snapshot.",
    summarySigned: "Подпись активна",
    summaryUnsigned: "Подпись недоступна",
    actionTitle: "Проверить пакет",
    actionHint: "Сначала посмотрите, что опубликовано сейчас. Затем либо проверьте live package, либо загрузите локальный .aep файл.",
    liveRecommended: "Рекомендуется",
    fileSelectedLabel: "Выбран файл",
    dropLabel: "Перетащите .aep сюда или выберите файл",
    fileHint: "Поддерживаются опубликованные evidence package и legacy bundle этого проекта.",
    verifyLive: "Проверить текущий снимок",
    liveHint: "Кнопка загружает текущий опубликованный пакет из `/data/snapshot.aep` и проверяет его локально в браузере.",
    verifyLiveTitle: "Проверить то, что сейчас в проде",
    uploadTitle: "Проверить локальный .aep файл",
    uploadHint: "Используйте это, если вы уже скачали пакет или получили его отдельно.",
    waiting: "Проверяем…",
    resultTitle: "Результат проверки",
    resultHint: "После проверки здесь появится уровень верификации, digest и данные манифеста.",
    resultEmptyTitle: "Пока ничего не проверено",
    resultEmptyHint: "Проверьте текущий опубликованный снимок или загрузите локальный .aep-файл, чтобы увидеть уровень верификации и digest.",
    levelsTitle: "Что означают статусы",
    levelsHint: "Страница различает полную проверку подписи, подтверждение целостности и ошибку.",
    heroSignatureHint: "Браузер проверил цифровую подпись пакета.",
    heroIntegrityHint: "Хеши совпали, но полная проверка подписи недоступна.",
    heroFailureHint: "Файл повреждён, неполон или не подходит по формату.",
    levelsSignature: "браузер подтвердил криптографическую подпись опубликованного evidence package.",
    levelsIntegrity: "цепочка целостности совпала, но пакет не даёт полной browser-side проверки подписи.",
    levelsFailure: "bundle повреждён, неполон или не соответствует ожидаемому формату.",
    transparencyTitle: "Что именно даёт эта проверка",
    transparencyHint: "Логика страницы следует простому правилу: сначала видно, что опубликовано, затем как это проверяется, и только потом сам результат.",
    transparencySignedTitle: "Что подписано",
    transparencySignedBody: "Подписывается опубликованный evidence package snapshot'а: payload, manifest, хеши и подпись. Это позволяет доказать, что содержимое не менялось после выпуска.",
    transparencyBrowserTitle: "Что проверяет браузер",
    transparencyBrowserBody: "Проверка идёт целиком на вашей стороне через Web Crypto API. Если пакет старого формата, страница честно показывает только подтверждение целостности, а не полную проверку подписи.",
    transparencyAuditTitle: "Где тут Aletheia / EATF",
    transparencyAuditBody: "Если в пакете есть Aletheia UUID и timestamp, они служат provenance-якорями для аудита и долгого хранения доказательства. Они не меняют санитарный вывод, а делают публикацию проверяемой.",
    signedAt: "Подписано",
    algorithm: "Основной алгоритм",
    digest: "SHA-256 payload",
    mode: "Режим подписания",
    okBadge: "Криптографическая подпись проверена",
    integrityBadge: "Пакет цел, но подпись не проверена полностью",
    failBadge: "Пакет не прошёл проверку",
    more: "Подробнее о процессе",
    noFile: "Файл не выбран.",
    useFile: "Выбран файл",
    postQuantum: "Постквантовая подпись",
    postQuantumIncluded: "ML-DSA-65 ✓",
    postQuantumNotIncluded: "не включена",
    rsaLegacy: "Легаси RSA",
    agent: "Агент",
    aletheiaUuid: "Aletheia UUID",
  },
  et: {
    title: "Snapshot'i verifikaator",
    eyebrow: "Kontrollitav päritolu",
    intro: TRUST_COPY.et.verifyIntro,
    trustCardTitle: "Avaldatud snapshot on allkirjastatud",
    trustCardBody: "Kaardil jääb alles ainult allkirja badge. Sellel lehel näed, millal snapshot avaldati, milliste andmete ja mudeliga see tehti, ning saad sama paketi kohe üle kontrollida.",
    publishedTitle: "Avaldatud snapshot",
    publishedHint: "Tehniline lisa: mis on praegu h2oatlas.ee-s avaldatud.",
    snapshotLabel: "Snapshot loodud",
    dataLabel: "Andmed hangitud",
    modelLabel: "Mudel treenitud",
    currentModelLabel: "Praegune mudel",
    pointsLabel: "Punkte kaardil",
    commitLabel: "Git SHA",
    signedModeLabel: "Allkirjastamise režiim",
    tsaLabel: "TSA ajatempel",
    historyTitle: "Refresh'i ajalugu",
    historyEmpty: "Ajalugu muutub sisukaks pärast järgmist snapshot'i uuendust.",
    summarySigned: "Allkiri olemas",
    summaryUnsigned: "Allkiri puudub",
    actionTitle: "Kontrolli paketti",
    actionHint: "Vaata kõigepealt, mis on avaldatud. Seejärel kontrolli kas live package'it või oma kohalikku .aep faili.",
    liveRecommended: "Soovitatud",
    fileSelectedLabel: "Valitud fail",
    dropLabel: "Tirige .aep fail siia või valige fail",
    fileHint: "Toetatud on avaldatud evidence package ja selle projekti legacy bundle.",
    verifyLive: "Kontrolli praegust snapshot'i",
    liveHint: "Nupp laadib praeguse avaldatud paketi aadressilt `/data/snapshot.aep` ja kontrollib selle brauseris kohapeal.",
    verifyLiveTitle: "Kontrolli seda, mis on praegu lives",
    uploadTitle: "Kontrolli kohalikku .aep faili",
    uploadHint: "Kasuta seda siis, kui pakk on juba alla laaditud või saadud mujalt.",
    waiting: "Kontrollin…",
    resultTitle: "Kontrolli tulemus",
    resultHint: "Pärast kontrolli kuvatakse siin verifitseerimise tase, digest ja manifesti andmed.",
    resultEmptyTitle: "Midagi pole veel kontrollitud",
    resultEmptyHint: "Kontrolli praegust avaldatud snapshot'i või laadi üles kohalik .aep fail, et näha verifitseerimise taset ja digest'i.",
    levelsTitle: "Mida staatused tähendavad",
    levelsHint: "Leht eristab täielikku allkirjakontrolli, tervikluse kinnitust ja viga.",
    heroSignatureHint: "Brauser kontrollis paketi digiallkirja.",
    heroIntegrityHint: "Räsid klapivad, kuid allkirja täielik kontroll pole saadaval.",
    heroFailureHint: "Fail on vigane, puudulik või vale formaadiga.",
    levelsSignature: "brauser kinnitas avaldatud evidence package'i krüptograafilise allkirja.",
    levelsIntegrity: "terviklusahel klappis, kuid bundle ei võimalda brauseris täielikku allkirjakontrolli.",
    levelsFailure: "bundle on vigane, puudulik või ei vasta oodatud formaadile.",
    transparencyTitle: "Mida see kontroll päriselt tõestab",
    transparencyHint: "Lehe loogika on lihtne: kõigepealt näed, mis on avaldatud, siis kuidas seda kontrollitakse, ja alles seejärel kontrolli tulemust.",
    transparencySignedTitle: "Mis on allkirjastatud",
    transparencySignedBody: "Allkirjastatakse avaldatud snapshot'i evidence package: payload, manifest, räsid ja allkiri. Nii saab tõendada, et sisu pole pärast avaldamist muudetud.",
    transparencyBrowserTitle: "Mida brauser kontrollib",
    transparencyBrowserBody: "Kontroll toimub täielikult sinu brauseris Web Crypto API kaudu. Kui pakett on vanemas formaadis, näitab leht ausalt ainult tervikluse kinnitust, mitte täit allkirjakontrolli.",
    transparencyAuditTitle: "Kuhu sobitub Aletheia / EATF",
    transparencyAuditBody: "Kui paketis on Aletheia UUID ja ajatempel, toimivad need auditi ja pikaajalise tõendamise provenance-ankrutena. Need ei muuda vee hinnangut, vaid teevad avaldatud snapshot'i kontrollitavaks.",
    signedAt: "Allkirjastatud",
    algorithm: "Põhialgoritm",
    digest: "SHA-256 payload",
    mode: "Allkirjastamise režiim",
    okBadge: "Krüptograafiline allkiri kontrollitud",
    integrityBadge: "Paketi terviklus klapib, kuid allkiri pole täielikult kontrollitav",
    failBadge: "Pakett ei läbinud kontrolli",
    more: "Rohkem protsessi kohta",
    noFile: "Faili pole valitud.",
    useFile: "Valitud fail",
    postQuantum: "Kvantijärgne allkiri",
    postQuantumIncluded: "ML-DSA-65 ✓",
    postQuantumNotIncluded: "puudub",
    rsaLegacy: "Vana RSA",
    agent: "Agent",
    aletheiaUuid: "Aletheia UUID",
  },
  en: {
    title: "Snapshot verifier",
    eyebrow: "Verifiable provenance",
    intro: TRUST_COPY.en.verifyIntro,
    trustCardTitle: "The published snapshot is signed",
    trustCardBody: "The map keeps only the signature badge. This page shows when the snapshot was published, which data and model it reflects, and lets you verify the exact package yourself.",
    publishedTitle: "Published snapshot",
    publishedHint: "Technical appendix for what is currently live on h2oatlas.ee.",
    snapshotLabel: "Snapshot generated",
    dataLabel: "Data fetched",
    modelLabel: "Model trained",
    currentModelLabel: "Current model",
    pointsLabel: "Points on map",
    commitLabel: "Git SHA",
    signedModeLabel: "Signing mode",
    tsaLabel: "TSA timestamp",
    historyTitle: "Refresh history",
    historyEmpty: "History becomes informative after the next snapshot refresh.",
    summarySigned: "Signature present",
    summaryUnsigned: "Signature unavailable",
    actionTitle: "Verify a bundle",
    actionHint: "First inspect what is published. Then either verify the live package or upload your own .aep file.",
    liveRecommended: "Recommended",
    fileSelectedLabel: "Selected file",
    dropLabel: "Drop a .aep file here or choose a file",
    fileHint: "Published evidence packages and this project's legacy bundles are supported.",
    verifyLive: "Verify the current snapshot",
    liveHint: "This fetches the currently published package from `/data/snapshot.aep` and verifies it locally in the browser.",
    verifyLiveTitle: "Verify what is live right now",
    uploadTitle: "Verify a local .aep file",
    uploadHint: "Use this when you already downloaded the package or received it separately.",
    waiting: "Verifying…",
    resultTitle: "Verification result",
    resultHint: "After verification, this panel shows the returned level, digest, and manifest details.",
    resultEmptyTitle: "Nothing verified yet",
    resultEmptyHint: "Verify the current published snapshot or upload a local .aep file to see the verification level and digest.",
    levelsTitle: "What the statuses mean",
    levelsHint: "The page distinguishes full signature verification, integrity-only validation, and failure.",
    heroSignatureHint: "The browser verified the package signature.",
    heroIntegrityHint: "Hashes matched, but full signature verification was not available.",
    heroFailureHint: "The file is damaged, incomplete, or the wrong format.",
    levelsSignature: "the browser verified the cryptographic signature of the published evidence package.",
    levelsIntegrity: "the integrity chain matched, but the bundle does not provide full browser-side signature verification.",
    levelsFailure: "the bundle is damaged, incomplete, or does not match the expected format.",
    transparencyTitle: "What this verification actually proves",
    transparencyHint: "The page now follows a simpler order: first what is published, then how it is checked, then the verification result.",
    transparencySignedTitle: "What is signed",
    transparencySignedBody: "The published snapshot evidence package is signed: payload, manifest, hashes, and signature travel together. That makes post-publication tampering detectable.",
    transparencyBrowserTitle: "What the browser checks",
    transparencyBrowserBody: "The verification runs fully on your side through the Web Crypto API. If the bundle is a legacy format, the page explicitly reports integrity-only validation rather than pretending it performed a full signature check.",
    transparencyAuditTitle: "Where Aletheia / EATF fits",
    transparencyAuditBody: "If the package carries an Aletheia UUID or timestamp, those act as provenance anchors for audit and long-term evidence retention. They do not change the water-quality verdict itself.",
    signedAt: "Signed at",
    algorithm: "Primary algorithm",
    digest: "SHA-256 payload",
    mode: "Signing mode",
    okBadge: "Cryptographic signature verified",
    integrityBadge: "Package integrity matched, but signature was not fully verified",
    failBadge: "Package did not pass verification",
    more: "More about the process",
    noFile: "No file chosen.",
    useFile: "Chosen file",
    postQuantum: "Post-quantum signature",
    postQuantumIncluded: "ML-DSA-65 ✓",
    postQuantumNotIncluded: "not included",
    rsaLegacy: "Legacy RSA",
    agent: "Agent",
    aletheiaUuid: "Aletheia UUID",
  },
};
