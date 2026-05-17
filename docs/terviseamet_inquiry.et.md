# Koostöökiri Terviseametile — vee kvaliteedi avaandmed

> **Status: DRAFT (Estonian translation).** Outgoing version of the
> cooperation letter. The Russian source lives in
> `docs/terviseamet_inquiry.md` and is kept as internal reference. The
> Estonian text below mirrors the structure of the source; technical terms,
> file paths, numbers, links and placeholders (`<author name>` etc.) are not
> translated. Awaits author signature and supervisor sign-off. Native-speaker
> review recommended before sending the long form (Stage 3–4).

## Intended recipients

- Terviseamet open-data team (vtiav.sm.ee maintainers)
- CC: project supervisor

## Subject line

Avatud lähtekoodiga vee kvaliteedi riskikaart + leiud 69 536 veeproovi põhjal — koostööettepanek

---

## Body

Lugupeetud Terviseameti meeskond,

### Kes me oleme

Oleme TalTechi tudengimeeskond (Masinõppe kursus), kes on viimaste kuude jooksul ehitanud teie avaandmete põhjal (`vtiav.sm.ee/index.php/opendata/`) täieliku andmetoru ja avaliku kodanikuteenuse.

Tulemuseks on **[h2oatlas.ee](https://h2oatlas.ee)** — interaktiivne avalik kaart, mis näitab viimast vee kvaliteedi staatust ja tõenäosuslikku riskihinnangut **2 196 asukoha** kohta üle Eesti: supluskohad, basseinid ja SPAd, joogivee ühisveevärgid ning joogiveeallikad. Kogu lähtekood on avalik: [github.com/tyche-institute/water-quality-ee](https://github.com/tyche-institute/water-quality-ee).

Kirjutame teile, et jagada mõningaid leide, mis võivad teile kasulikud olla, küsida andmestruktuuri kohta mõned täpsustavad küsimused ning pakkuda omalt poolt tööriistu ja koostöövalmidust.

---

### Mida me leidsime — ja mida me oma poolelt parandasime

Andmetoru valideerides ehitasime deterministliku normikontrolli, mis võrdleb iga proovi välja `hinnang` avaldatud parameetrite väärtustega EL-i ja Eesti piirväärtuste alusel. Kolm leidu:

**1. Parandasime oma basseinide normid (võib olla teile asjakohane).**
Meie esialgne vaba kloori vahemik basseinide puhul oli [0,2; 0,6] mg/l. Empiiriline kontroll 339 vastava (compliant) basseiniproovi vastu näitas, et 85% neist sisaldas vaba kloori vahemikus 0,6–1,9 mg/l — meie süsteem märkis kõik need ekslikult mittevastavaks. Kontrollisime üle Sotsiaalministri 31.07.2019 määruse nr 49 (Lisa 4) ja parandasime vahemiku **[0,5; 1,5] mg/l** peale. Sarnaselt parandasime seotud kloori piiri ≤ 0,4 → **≤ 0,5 mg/l**.

Kui mõni teie alamsüsteem, töölaud või kolmandate isikute andmetarbija kasutab sarnaseid piirväärtuste tabeleid, võivad meie empiiriline analüüs ja 288 vale-positiivse juhu loend olla kasulikuks ristkontrolliks.

**2. 86,2% märgenditest on avaldatud andmete põhjal taastoodetavad; 3,1% ei ole.**
Pärast omapoolseid parandusi langeb meie normikontroll kokku ametliku `hinnang` väljaga **59 958 proovis 69 536-st** ehk **86,2%**. Samas on **2 164 proovi (3,1%)** märgistatud `ei vasta nõuetele`, kuigi ükski avaldatud parameeter ei ületa meie kontrolli järgi ühtegi kohaldatavat piiri. Nimetame neid "peidetud rikkumisteks" (hidden violations) — vastavusotsust ei saa avaandmete põhjal üksi taastoota.

Ajaline ristkontroll näitab, et osaliselt on tegemist **mõõtmiste sageduse efektiga**: `veevargi` domeenis on 97,9% "puuduvatest" keemiaparameetritest tegelikult sama koha kohta teistes proovides mõõdetud (kvartaalne keemia vs proovipõhine mikrobioloogia). See ei ole andmeviga — see peegeldab seire ajakava.

**3. Teie XML on terviklik — meie parser ei kaota midagi.**
Skaneerisime kõik `<proovivott>` alamtagid läbi 160 MB tootmisfailides (4 domeeni × 6 aastat). Kõik 9 mitte-parsitud tagi on metaandmed (inspektorite nimed, protokollide ID-d, proovivõtu metoodika). Meie parser ei kaota ühtegi mõõteparameetrit.

---

### Mida me sooviksime selgemalt mõista

Need küsimused aitaksid meil teie andmeid täpselt kirjeldada nii projekti aruandes kui ka teenuses h2oatlas.ee:

**Q1.** Kas avaandmete XML on iga proovi labori-andmestiku **täielik peegeldus** või **avaldatud alamhulk**? Kui alamhulk — kas valikukriteeriumid on dokumenteeritud?

**Q2.** Kas väli `hinnang` tuletatakse ainult avaldatud parameetritest või võib see tugineda ka lisaandmetele või kontekstile, mida XML-is ei ole?

**Q3.** Kas erinevatel kohatüüpidel on teadlikult erinevad kohustuslike parameetrite profiilid? (Märkame, et supluskoha proovid ei sisalda kunagi keemiaparameetreid, samas kui basseinide proovides puudub sageli mikrobioloogia.)

**Q4.** Keemiaparameetrid (nitraadid, kloriidid, sulfaadid) `veevargi_veeproovid` failides esinevad ainult 5–7% proovidest. Kas tegu on **kvartaalse mõõtmise ajakavaga** või mõõdetakse neid, kuid ei avaldata alati?

**Q5.** Kas on dokumenteeritud avaldamise sageduse poliitika, millele saaksime oma piirangute jaotises viidata?

**Q6.** Kui sageli Terviseamet uuendab avaandmete XML-faile `vtiav.sm.ee` lehel? Kas see toimub reaalajas (uute laboritulemuste saabudes), iga päev, iga nädal või muu sammuga? Meie kodanikuteenus ([h2oatlas.ee](https://h2oatlas.ee)) värskendab praegu andmeid ja treenib mudeleid **iga nädal** (esmaspäeviti) ja **iga kuu 1. kuupäeval**, automatiseeritud GitHub Actions kaudu. Kui teie andmed uuenevad sagedamini, oleme valmis oma sammu vastavalt kohandama. Millist värskendussagedust peate avalikule teenusele nagu meie omale sobivaks?

---

### Mida me saame omalt poolt pakkuda

Saaksime jagada järgmist:

- **Avatud lähtekoodiga audititööriistakast** (`src/audit/label_vs_norms.py`, 250 rida) — deterministlik kontroll, mille saab käivitada iga uue andmeväljavõtte peal, et koheselt kontrollida normikohasust ametliku märgendi suhtes. Tööriist impordib piirväärtused otse feature-tabelist, nii et need püsivad automaatselt sünkroonis. Võiks olla kasulik teie enda QA-protsessile või kolmandate isikute andmetarbijatele.

- **[h2oatlas.ee](https://h2oatlas.ee)** — avalik kaart, mis on täielikult ehitatud teie andmetele. Oleme valmis seda teie tagasiside põhjal kohandama — lisada hoiatusi, parandada domeenide silte või lisada lingid teie ametlikele lehtedele.

- **Auditi artefaktid** — proovipõhine parquet-fail 69 536 reaga, klassifikatsioonimustritega ja mittemõõdetud parameetrite signatuuridega. Kättesaadav teie ülevaatuseks.

- **Koostöö** — kui Terviseametil on andmekvaliteedi algatusi, dokumentatsiooniprojekte, praktika- või koostöövõimalusi või soovite lihtsalt tudengimeeskonna värsket vaadet avaandmete torule, oleme tõsiselt huvitatud. Projekt algas kursusetööna, kuid on kasvanud millekski, millest me hoolime.

---

### Kontekst

Projekt on osa TalTechi Masinõppe (Machine Learning) kursusest. Meie prioriteetne mõõdik on **Recall rikkumiste klassil** — vale-negatiivne tähendab vee turvaliseks ennustamist olukorras, kus see ei ole. Parim mudel (LightGBM) saavutab **AUC = 0,984** ja tuvastab **94,9% rikkumistest** 80% täpsuse juures ajaliselt jaotatud testihulgal (treenitud kuni 2024, testitud 2025+).

Soovime selgelt rõhutada: me ei kritiseeri avaandmete kanalit — peame seda suurepäraseks ning kogu meie projekt tugineb sellele. Kirjutame, sest usume, et nende leidude ja tööriistade jagamine on kasulikum kui nende hoidmine ainult kursuse aruandes.

Suur tänu teile avatud andmete haldamise eest,

`<author name>`
`<author email>`
[h2oatlas.ee](https://h2oatlas.ee) · [GitHub](https://github.com/tyche-institute/water-quality-ee)

---

## Lisa — Phase 1 dokumentatsioonitöö käigus tekkinud küsimused

Projekti dokumentatsiooni vormistamise käigus (AI Act vastavuse teekaardi
Phase 1 — vt `docs/ai_act_self_assessment.md`) tekkisid täpsemad konkreetsed
küsimused, mille lisaksime lõplikku kirja. Seda jaotist täiendatakse pidevalt
Phase 2–3 edenedes; Terviseametile saadetav lõppversioon konsolideerib need.

### A1 — Skeemi stabiilsus ja asukohtade ümbernimetamised (Datasheet §7)

**Q7.** Märkasime aastatevahelisi asukohtade ümbernimetamisi, mis tekitavad
nähtavaid duplikaate, kui normaliseerimissammu ei rakendata (nt "Harku järve
supluskoht" 2021 → "Harku järve rand" 2025; "veevärk" → "ühisveevärk").
Käsitleme seda funktsiooniga `normalize_location()` failis `src/data_loader.py`.
Kas Terviseamet hoiab ajaloolisi ja praeguseid asukohanimesid sidustavat
vastendustabelit (crosswalk) või on ümbernimetamise poliitika dokumenteeritud?
Avaldatud vastendus võimaldaks järgneda kasutavatel teenustel vältida
vaikseid andmekvaliteedi regressioone.

**Q8.** Milline on avaandmete XML-failide säilituspoliitika? Kas vanemaid
aastaid kunagi taasavaldatakse parandustega (nt pärast regulatiivset auditit)?
Soovime allkirjastamisel (Phase 3) kinnitada täpselt selle faili versiooni,
mida kasutati — seetõttu oleks väärtuslik stabiilse versioneerimise garantii
või kinnitus, et failid on pärast avaldamist **ainult-lisanduvad**.

### A2 — Rolli klassifikatsioon AI Act-i alusel (enesehinnang §4)

**Q9.** Oleme klassifitseerinud h2oatlas.ee teenuse **mitte-kõrge riskiga**
tehisintellekti süsteemiks EL AI määruse Annex III §2(a) alusel, põhjendades
seda sellega, et tegu on tagantjärele visualiseerimisega, mitte
turvakomponendiga. Kogu põhjenduskäik on dokumendis
`docs/ai_act_self_assessment.md` §4. Kas teie (või teie juriidiline meeskond)
näete klassifikatsiooni teisiti? Kui plaanite avaandmete põhjal sisemisi
analüütilisi mudeleid arendada, on sama enesehinnangu mall korduvkasutatav;
oleme valmis selle tühja malli teiega jagama.

### A3 — Domeenipõhine nõrkus (Model Card §7 ja `notebooks/05_evaluation.ipynb`)

**Q10.** Meie domeenipõhine hinnang näitab, et mudel on nõrgim `joogivesi`
domeenis (n = 376 proovi), kus Recall klassil 0 jääb alla kogukorpuse
keskmise. Osa langusest peegeldab tõenäoliselt väikest valimit, kuid osa
võib olla seotud sellega, et joogiveeallikatel (kaevud, allikad) on
domeenispetsiifilised parameetrite profiilid, mida me täielikult ei taba.
Kas on avaldatud juhiseid joogivee proovide kanoonilise parameetrite kogumi
kohta, mis ulatuks XML-is olevast kaugemale?

### A4 — Dokumenteeritud proovide värskendamise viivitus (Datasheet §7)

**Q11.** Plaanime avaldada allkirjastatud snapshotte iga nädal (esmaspäeviti)
pluss iga kuu 1. kuupäeval. Kui teie avaldamise rütm on erinev või varieerub
domeeni kaupa, oleme rõõmuga valmis oma sammu kohandama, et mitte pakkuda
kasutajatele snapshotti, mis tundub värskem kui aluseks olevad andmed
tegelikult lubavad. Kasulik oleks tüüpiline lõpust-lõpuni viivitus
(proovivõtt → labor → avaldamine).

### A5 — Drift-monitori leiud (`scripts/drift_monitor.py`)

Meie CI drift-monitor (PSI igal 15 numbrilisel parameetril + KL divergents
märgendil) võrdleb treeninguakent (2021–2024) viimase aastaga. Iga kord, kui
monitor raporteerib WARN või ALERT, peame snapshoti tagasi ja uurime
põhjuseid. Soovime oma tuvastusi korreleerida teile teadaolevate
metoodiliste muudatustega:

**Q12.** Kas on aastaid, mil mõne 15 parameetri analüüsimeetod, akrediteeritud
labori paneel või aruandluse piirväärtus muutus? Lühike muudatuste logi (kasvõi
mitteametlik) võimaldaks meil märkida drift-sündmused "teadaolevaks
metoodiliseks muudatuseks", mitte "tundmatuks regressiooniks", ja vältida
vale-alarme.

**Q13.** Märgendite jaotus (`compliant`, mis tuletatakse väljast `hinnang`)
nihkub meie korpuses 2024 ja 2025 vahel ~3 protsendipunkti. Kas täheldate
sama oma sisemistes näitajates? Kui jah, kas põhjus on operatiivne (rohkem
proovivõttu kõrge riskiga kohtades) või definitsiooniline (piirväärtuse
muutus)?

### A6 — Inimese järelevalve ettepanek (`docs/human_oversight.md`)

Oleme välja töötanud kolme osapoole otsustuspuu (kodanik / haldaja /
Terviseamet). Terviseameti haru kirjeldab, kuidas saaksite kasutada välju
`prediction_id` + `feature_hash` (meie snapshoti Phase 2 artefaktid), et
taastoota mis tahes mudeliväljundit, mille kohta kodanik küsib.

**Q14.** Kas selline töövoog on teile kasulik? Kui jah, saame lisada
h2oatlas.ee teenusele lühikese jaotise, mis viitab Terviseameti
kontaktipunktile; kui ei, dokumenteerime selle haru üksnes ettepanekuna.

### A7 — FRIA-light ja laste ohutuse leevendamine (`docs/fria_light.md`)

Lapsed on basseinide ja supluskohtade ebaproportsionaalselt suur
kasutajagrupp. Meie FRIA-light märgib selle järelejäänud riskina R1 ja loetleb
leevendusmeetmed (UI järjekord, andmelünga teavitusriba, domeenipõhised
mõõdikud).

**Q15.** Kas Terviseamet juba koostab oma avalike töölaudade kohta
põhiõiguste- või DPIA-dokumentatsiooni? Kui jah, soovime keelekasutust ja
ulatust ühildada. Kui ei, on meie FRIA-light mall korduvkasutatav.

### A8 — Allkirjastatud snapshoti päritolu (`scripts/sign_snapshot.py` + `docs/key_management.md`)

Iga h2oatlas.ee teenuses avaldatud snapshot kaasneb nüüd `.aep` tõendite
paketiga: kanoniseeritud koormus, SHA-256 räsi, ML-DSA-65 (kvantijärgne, FIPS
204) allkiri pluss legacy RSA-PSS-4096 osa tagasiühilduvuse jaoks, ja
X.509 sertifikaat, millega allkiri loodi. Kontroll toimub täies mahus
kasutaja brauseris lehel `/verify` (serveripoolset päringut pole vaja).

Allkirjastamise taustaks on `https://api.eatf.eu` aadressil töötav
Aletheia-teenus (Hetzneris majutatud, asendab mais 2026 pensionile
saadetud `eatf.duckdns.org`). Arenduseks ja taustteenuse seisaku ajaks
on olemas kohalik fallback-allkirjastaja.

**Q16.** Oleme valmis sama allkirjastamise ahelat laiendama mis tahes
Terviseameti avaldatavale XML-failile. Kasu teile: järgneda kasutavad
andmetarbijad (sh h2oatlas.ee, ajakirjanikud, teadlased) saaksid
krüptograafiliselt kontrollida, et nende allalaaditud XML on originaal, mitte
muudetud koopia. Pilootprojekt ühe domeeni peal (näiteks `basseinid`) võtab
meie poolelt umbes 1 päeva. Kas see oleks teile kasulik?

**Q17.** Meil ei ole veel usaldusväärselt kolmandalt osapoolelt CA-sertifikaati;
praegune võti on iseallkirjastatud. Kui Terviseametil juba on — või ta on
omandamas — domeeni-valideeritud sertifikaati `vtiav.sm.ee` jaoks, saaksime
seda (või sellest tuletatud vahesertifikaati) kasutada teie andmetele
viitavate `.aep` pakettide usaldusankrana. See seoks tõendite ahela teie
organisatsiooni avaliku identiteediga, mitte ainult meie omaga.

---

## Attachments checklist (before sending)

This block is metadata for internal coordination; it is **not** part of the
outgoing letter and is intentionally kept in English to stay in sync with the
RU source (`docs/terviseamet_inquiry.md`).

- [x] Numbers populated from full-corpus audit (69,536 probes, 2,164 hidden violations)
- [x] Three concrete probe examples (veevark / basseinid / supluskoha)
- [x] Pool norms correction documented with empirical evidence
- [x] XML parity scan results (zero measurement params lost)
- [x] Temporal analysis: veevark 97.9% frequency variance
- [x] Model Card (`docs/model_card.md`) — Mitchell-style model documentation
- [x] Datasheet (`docs/datasheet.md`) — Gebru-style data-provenance record
- [x] AI Act voluntary self-assessment (`docs/ai_act_self_assessment.md`) — risk tier + triggers
- [x] Per-domain metrics in `notebooks/05_evaluation.ipynb` (AI Act Art 15 disaggregation)
- [x] Public data-gap notice banner live on h2oatlas.ee (Phase 1.5 of compliance roadmap)
- [x] Drift monitor output (Phase 2) — `scripts/drift_monitor.py`
- [x] Human-oversight decision tree (Phase 2) — `docs/human_oversight.md`
- [x] FRIA-light (Phase 2) — `docs/fria_light.md`
- [x] Signed `.aep` snapshot URL (Phase 3) — `citizen-service/artifacts/snapshot.aep`
- [x] This is the Estonian version of the cooperation letter
- [ ] Native-speaker review of the Estonian text
- [ ] Attach audit notebook + parquet artifact (or link to repo)
- [ ] Project supervisor sign-off
- [ ] Send to: `kesk@terviseamet.ee` (official public contact); CC supervisor; optionally CC `press@terviseamet.ee` if no response
