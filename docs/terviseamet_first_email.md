# First-contact email to Terviseamet — concise version

> Status: draft for supervisor review before sending.
> Prepared: 2026-05-11.
> Context: follows the longer cooperation draft in `docs/terviseamet_inquiry.md` and the audit findings in `docs/phase_10_findings.md`.

## Recommended recipients

### Primary `To`

- `kesk@terviseamet.ee`
  Reason: this is the official public contact for sending a formal inquiry to Terviseamet and is the safest routing point for a technical question that may need internal forwarding.

### Recommended `CC`

- Project supervisor

### Optional `CC` only if you want communications visibility

- `press@terviseamet.ee`
- `irina.satsuta@terviseamet.ee`
- `merilin.vernik@terviseamet.ee`

Use these only if the goal is not purely technical clarification, but also early relationship-building around a public-facing civic project. For a first technical inquiry, `kesk@terviseamet.ee` is enough.

### Not recommended as primary addressees for this first mail

- `info@terviseamet.ee`
  Too generic for this topic.
- `avaldus@terviseamet.ee`
  Better suited to formal complaints/applications, not a collaboration-style data inquiry.
- `labor@terviseamet.ee`
  Useful for lab-service topics, but not the best first point for open-data / VTI / `hinnang` logic questions.

## Proposed subject line

`TalTechi tudengiprojekt H2O Atlas: küsimused Terviseameti veeandmete kohta ja koostööettepanek`

Alternative, slightly shorter:

`Küsimused Terviseameti veeandmete kohta + tudengiprojekti H2O Atlas lühitutvustus`

## Draft email

Lugupeetud Terviseameti meeskond

Oleme TalTechi masinõppe kursuse tudengimeeskond. Viimaste kuude jooksul oleme ehitanud teie avaandmete põhjal täieliku andmetoru ja avaliku kaardirakenduse **H2O Atlas**:  
<https://h2oatlas.ee>

Rakendus koondab Terviseameti veeandmeid ühele kaardile ja kuvab:

- ametliku vastavuse staatuse Terviseameti avaandmetest,
- viimase proovi kuupäeva ja mõõdetud näitajad,
- mudelipõhise rikkumisriski hinnangu,
- ajaloo ja selgitused kasutajale arusaadavas vormis.

Kogu projekt on avalik lähtekood:
<https://github.com/tyche-institute/water-quality-ee>

Kirjutame teile kahel põhjusel:

1. jagada lühidalt mõningaid leide, mis tekkisid andmete valideerimisel;
2. küsida mõned täpsustavad küsimused, et kirjeldaksime teie andmeid oma projektis korrektselt.

## Lühike kokkuvõte meie leidudest

- Analüüsisime kokku **69 536 veeproovi** neljas domeenis aastatest **2021–2026**.
- Ehitasime deterministliku normikontrolli, mis võrdleb välja `hinnang` avaldatud parameetritega.
- Pärast oma poolsete normiparanduste tegemist langeb ametlik hinnang avaldatud andmete põhjal kokku **59 958 juhul 69 536-st** ehk **86,2%**.
- Samas jäi alles **2 164 proovi (3,1%)**, kus märge on `ei vasta nõuetele`, kuid ükski avaldatud parameeter ei ületa meie kontrolli järgi kohaldatavat piiri.
- Kontrollisime ka parseri poole pealt, et me ei kaotaks XML-ist mõõteandmeid. Täismahus kontrolli järgi ei lähe meie parseris kaduma ühtegi mõõteparameetrit; tuvastamata väljad olid metaandmed.

See viitab meie hinnangul sellele, et osa vastavusotsusest võib sõltuda:

- parameetritest, mida ei avaldata igas proovis,
- mõõtmiste erinevast sagedusest,
- või lisakontekstist, mida XML-is täielikult ei kajastata.

## Küsimused

Oleksime väga tänulikud, kui saaksite aidata järgmiste küsimustega:

1. Kas avaandmete XML on iga proovi **täielik** peegeldus või avaldatakse sellest ainult **osa**?
2. Kas väli `hinnang` tuletatakse ainult avaldatud parameetritest või võib see tugineda ka lisainfole, mida XML-is ei ole?
3. Kas erinevatel veeliikidel / kohtadel ongi teadlikult erinev kohustuslike parameetrite profiil?
4. Kas harvem esinevad keemiaparameetrid `veevark` andmetes viitavad mõõtmiste **perioodilisusele** või on osa andmeid lihtsalt avalikust vaatest puudu?
5. Kas Terviseametil on dokumenteeritud avaandmete **uuendussagedus**, millele saaksime oma avalikus teenuses viidata?
6. Kui see kiri jõudis esmalt üldkontakti, kas saaksite selle palun suunata kolleegidele, kes tegelevad **keskkonnatervise / veeandmete / VTI või KTI** teemadega?

## Mida saame omalt poolt jagada

Soovi korral saadame teile:

- lühikese auditikokkuvõtte tabelitega,
- näited juhtudest, kus ametlikku hinnangut ei saa avaandmete põhjal taastoota,
- meie kontrollskripti kirjelduse,
- või lühikese demo H2O Atlase teenusest.

Kui see on teile kasulik, saame saata ka ingliskeelse kokkuvõtte või kohandada küsimused teie jaoks mugavamasse vormi.

Täname juba ette teie aja eest.

Lugupidamisega

`<nimi / nimed>`  
TalTech masinõppe kursuse projekt  
H2O Atlas  
`<e-post>`  
<https://h2oatlas.ee>  
<https://github.com/tyche-institute/water-quality-ee>

## Notes for sending

- Keep the first email short; attach nothing on the first contact unless requested.
- If they respond positively, the next message can include:
  - a 1-page PDF summary,
  - 3 concrete `hidden_violation` examples,
  - the longer cooperation draft from `docs/terviseamet_inquiry.md`.
- If there is no answer after 7–10 business days, resend the same message once and add `press@terviseamet.ee` in `CC`.
