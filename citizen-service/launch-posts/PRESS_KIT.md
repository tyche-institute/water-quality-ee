# H2O Atlas — press kit & launch playbook

This document is a how-to for **getting H2O Atlas in front of the right
people** without becoming a full-time SMM operator. Pragmatic, low-effort,
high-impact.

## TL;DR launch sequence

1. **Day 0 — Facebook Page**: upload avatar + cover + first post (assets in `frontend/public/social/`, copy in `launch-{en,et,ru}.md`).
2. **Day 0 — Personal LinkedIn / Facebook timeline**: same launch post, English version, with the `launch-image-en.png`.
3. **Day 1 — Estonian open-data / civic-tech communities**: post in 2-3 channels (list below).
4. **Day 2 — Targeted email to ≤5 journalists** (template + contacts below).
5. **Day 7+** — react to whatever lands. If nothing lands, re-post in Estonian on a fresh day (different time of week).
6. **Monthly thereafter** — `gh workflow run social-digest.yml` with `dry_run=true`, eyeball the preview, manually flip to `dry_run=false` if it looks good.

---

## Brand assets (already generated — in repo after merge)

| Asset | Path | Where to use |
|-------|------|--------------|
| Page profile picture (avatar) | `frontend/public/social/fb-avatar.png` | FB Page → Edit profile picture (auto-circles to 360×360) |
| Page cover photo | `frontend/public/social/fb-cover.png` | FB Page → Edit cover (1640×624 recommended) |
| Launch post image — Estonian | `frontend/public/social/launch-image-et.png` | Attach to ET launch post |
| Launch post image — Russian | `frontend/public/social/launch-image-ru.png` | Attach to RU launch post |
| Launch post image — English | `frontend/public/social/launch-image-en.png` | Attach to EN launch post |
| Open Graph fallback | `frontend/public/og-default.png` | Auto-served when h2oatlas.ee root is shared |
| Apple touch icon | `frontend/public/apple-touch-icon.png` | Auto-used on iOS / Android home screens |

To regenerate any of these (e.g. after brand tweaks):

```bash
python3 citizen-service/scripts/build_social_assets.py
```

---

## Posting playbook

### Facebook Page — first post (DAY 0)

1. Open https://www.facebook.com/H2O.Atlas (or your custom URL)
2. Edit profile photo → upload `fb-avatar.png`
3. Edit cover photo → upload `fb-cover.png`
4. Compose new post → paste **long version** from `launch-en.md` (default to English; you can later post the same in ET and RU as separate posts a few days apart)
5. Attach `launch-image-en.png`
6. Post

### Personal Facebook & LinkedIn (DAY 0–1)

Use the **long version** from `launch-en.md`, attach `launch-image-en.png`.
Tag relevant people / organizations:
- TalTech (`@TalTech` on FB, `Tallinn University of Technology` on LinkedIn)
- Terviseamet
- Open Knowledge Estonia
- Anyone in your TalTech ML cohort

### X / Twitter (optional)

Use the **short version** in `launch-en.md`. Twitter scrapes OG image
from h2oatlas.ee automatically — no need to attach the launch-image
manually (it's smaller and gets cropped weirdly).

### Telegram channels / chats (optional)

Use the **Telegram caption** from `launch-{ru,et,en}.md` depending on the
audience of the channel.

---

## Estonian open-data & civic-tech channels (post here)

| Channel | URL | Audience | How to post |
|---------|-----|----------|-------------|
| Open Knowledge Estonia (FB) | https://www.facebook.com/OpenKnowledgeEstonia | OK Estonia community | Direct post on their page (let them decide to share) or DM admin |
| Avaandmed.ee | https://avaandmed.eesti.ee | Government open-data portal | Submit your re-use of `vtiav.sm.ee` dataset via the contact form |
| TalTech Open Data Society | (find on FB / Discord) | TalTech students | Post in cohort group |
| GovTech Estonia (LinkedIn) | https://www.linkedin.com/company/govtech-estonia | E-Estonia professionals | Comment on their post + tag |
| Estonian Hacker Network (FB / Telegram) | search "Estonia hackers" | Tech community | Post launch URL |
| TalTechi spaces / Slack | (internal) | Lecturers, classmates | Whatever your cohort uses |

---

## Journalists to email (DAY 2)

Keep email short. Template at the bottom of this file.

| Outlet | Beat | Contact (verify before sending) |
|--------|------|---------------------------------|
| ERR Novaator | Science / open data | toimetus@err.ee, science@err.ee |
| Postimees data desk | Investigative + data | toimetus@postimees.ee |
| Eesti Päevaleht | Society | toimetus@epl.ee |
| Geenius.ee | Tech / civic-tech | toimetus@geenius.ee |
| Sirp | Culture, has tech-policy column | sirp@sirp.ee |
| Delfi.ee | General news | toimetus@delfi.ee |

**Do NOT mass-email.** Pick 2-3 outlets you actually read, send each a
slightly customized note.

### Email template (English)

> Subject: H2O Atlas — interactive map of Estonian water quality (open
> data + ML)
>
> Hi [name],
>
> I built H2O Atlas (https://h2oatlas.ee) — an interactive map of every
> Terviseamet-monitored swimming spot, drinking-water network, pool and
> source in Estonia: 2,199 locations, 69,000+ samples. Each location has
> Terviseamet's official compliance verdict plus a ML risk assessment
> from four trained models.
>
> It's a TalTech Machine Learning master's project, open code + open data,
> no ads.
>
> A few angles that may interest your readers:
> - Which counties have the most/fewest current violations
> - The model occasionally flags risk in places Terviseamet doesn't —
>   sometimes the model catches something, sometimes it's a false alarm;
>   either way it's an interesting case study in regulator vs. ML
>   disagreement
> - The model recently confirmed [pick a noteworthy finding from
>   monthly digest]
>
> Happy to walk you through the methodology or the data. Code:
> github.com/tyche-institute/water-quality-ee.
>
> Best,
> [you]

### Email template (Estonian)

> Subject: H2O Atlas — Eesti veekvaliteedi interaktiivne kaart
>
> Tere [name],
>
> Ehitasin H2O Atlase (https://h2oatlas.ee) — interaktiivse kaardi kõigist
> Terviseameti jälgitavatest supluskohtadest, ühisveevärkidest, basseinidest
> ja joogiveeallikatest Eestis: 2199 punkti, 69 000+ proovi. Iga koha
> juures ametlik vastavusstaatus + masinõppemudeli riskihinnang neljast
> mudelist.
>
> Tegu on TalTechi Masinõppe magistritööga, avatud lähtekood + avatud
> andmed, ei reklaami.
>
> Mõned vaatenurgad, mis võivad lugejaid huvitada:
> - Maakonniti — kus on kõige rohkem/vähem rikkumisi
> - Mudel märgib mõnikord riski kohtades, kus Terviseamet ei märgi — see
>   regulaatori-vs-ML lahknevus on huvitav case study
> - Mudel hiljuti tuvastas [vali huvitav leid kuukokkuvõttest]
>
> Hea meelega selgitan metoodikat või andmeid. Kood:
> github.com/tyche-institute/water-quality-ee.
>
> Tervitades,
> [sina]

---

## Things you do NOT need to do (over-engineering for a master's project)

- 🚫 **Press release PDF** — modern outlets prefer email or DM, not a
  press release attachment.
- 🚫 **Promo video / GIF** — would be nice but a 10× effort multiplier;
  the OG cards already give a static preview.
- 🚫 **Newsletter / mailing list** — overkill for this audience.
- 🚫 **Twitter / X account** — use share buttons, optionally manually
  post from your personal account.
- 🚫 **Buying ads** — your audience reads news and Open Knowledge
  channels for free; ads have terrible ROI for civic data projects.
- 🚫 **Daily / weekly auto-posts** — feed pollution. Monthly digest
  (already configured) is the right cadence.

---

## What to do AFTER launch

| When | What |
|------|------|
| Day +7 | Check FB Page Insights: how many post impressions? Engagement? Adjust subsequent posts. |
| Month +1 | First monthly digest via `gh workflow run social-digest.yml` (dry-run, then real). |
| Beach season (June-Aug) | Consider switching the digest to focus on swimming spots; add water-temperature data to the snapshot if available in Terviseamet XML. |
| News pickup | If picked up by a newsroom, manually share their article from your personal feeds with a thank-you. Ride the momentum. |
| Master's defence | Prepare a 30-second elevator pitch. The launch post is essentially that, polished. |

---

## Useful URLs (bookmark these)

- Facebook Sharing Debugger: https://developers.facebook.com/tools/debug/
- LinkedIn Post Inspector: https://www.linkedin.com/post-inspector/
- Google Rich Results Test: https://search.google.com/test/rich-results
- Google Search Console: https://search.google.com/search-console (submit `https://h2oatlas.ee/sitemap.xml` here once after launch)
