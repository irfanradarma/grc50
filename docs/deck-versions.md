# SIGNAL deck versions

## Primary: Keynote, 21 October 2026

Entry: `website/deck/index.html`. Source, styles and reference notes: `website/assets/keynote/`. The 46-frame outline in `website/assets/data/deck-outline.json` is also the server's live-presentation contract. Stable keys from the previous deck are retained; two additional keys introduce AI across the risk cycle and the difference between automation and integration.

The full Identify → Assess → Treat → Monitor cycle explicitly retains human authority. Section 5 describes SIPT/RP/CMCA conceptually and contains no SIGNAL app walkthrough. The actual read-only SIGNAL walkthroughs are used in the audience exercise only.

Presenter and audience continue to use the session-linked deck URLs from Admin. Presenter writes remain owner-authorized by the API. Audience browsing suspends following until Return to live is selected. The right-edge drawer opens a clickable section/slide navigation. Arrow-key navigation does not reveal the chrome.

## Backup: editorial deck

Entry: `website/deck-archive/index.html`.

Published paths: `/grc50/deck-archive/` and `/grc50/presentation/deck-archive/`.

The previous production source is preserved by tag `backup/editorial-before-keynote-2026-10-21`, pointing to commit `e8195617c56d641e49e0a0d998d45350b3dfef2b`. The archive uses the existing editorial JS/CSS and `deck-outline-legacy.json` (44 slides). Its original content and interaction tests remain in the repository. Treat it as a standalone archive; use the primary Keynote deck for live sessions with the current server outline.

The original 44-slide local design-study files remain under `experiments/keynote/` as an additional design backup. Its entry now redirects to the approved primary deck.

## Local review

Run `./experiments/keynote/start-local.ps1`. Open `http://127.0.0.1:8090/website/deck/?present=1`. Read-only app guides are served under `/_app/` through a local-only proxy, with Vite on port 8091. No database is needed to view the deck and guides. Production uses its configured Pages app URL and Render API.

## Publication

Publish both the frontend and the API because the live slide outline now includes two new keys. No database schema, credentials, Atlas policies or application tables need to change for this release.
