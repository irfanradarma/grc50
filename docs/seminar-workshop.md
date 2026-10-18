# HORI seminar: strategic risk hands-on

The 31-slide English deck and three-organization app follow [the seminar plan](seminar-plan.md). Participants challenge growth assumptions, market choices, business models and investment commitments using real news and authored internal evidence. Current risk, projected protection and measured KPI achievement remain separate.

## Start locally

```powershell
& ./app/scripts/start-local-db.ps1
npm --prefix app run dev
```

| Purpose | Address |
|---|---|
| Presenter | http://localhost:5173/admin |
| Audience | http://localhost:5173/audience |
| Deck | http://localhost:5173/presentation/deck/ |
| Owned session | /admin/sessions/CODE |
| Private participant session | /audience/sessions/CODE |

Vite listens on LAN and proxies the loopback API and presentation. Phones need the laptop's reachable Wi-Fi address on port 5173. No firewall/cloud changes are made automatically.

## Presenter sequence

1. Create a **new session** in /admin. This is scenario version 3; earlier operational sessions remain preserved and are not mixed into the new catalog.
2. Open the deck in the owner browser. On slide 14, paste the new audience session link and show the QR.
3. Participants choose an organization and at least one objective. Recommend its first growth objective for the shared 12 → 16 example. Each company has two objectives and four strategic risks.
4. Orient to Dashboard, Risk Monitoring (Risks / Mitigation plans) and Risk Trigger. All four publishers start enabled.
5. Slide 17 presents the real ANTARA tariff announcement dated 3 April 2025. The exercise is as of **8 April 2025**; 32% is the historical announced rate, not today's rate. Slide 18 reveals the strategic exposure contrast.
6. Release **Guided case**. Export logistics and seafood exports may be exposed; domestic software has no established direct goods-tariff exposure. Participants verify scope, capture/neglect, then explicitly keep/update the assessment.
7. For the first export-growth risk, consider 12 → 16. Review the strategic response, owner, deadline and expected protection. Saving a plan does not reduce current risk. Other selected risks can have different starting/proposed scores.
8. Choose **Load strategic case news** for the dated, verified eight-article pack. Inspect headlines, source coverage and organization previews. CNN has no article in this verified pack; zero is displayed. Do not imply every enabled publisher returned news.
9. Alternatively choose **Capture current strategic news** for on-demand live RSS results. Dates and live labels remain explicit. Inspect before release; do not narrate current articles as April 2025 events.
10. Release the external batch, then start the 3–5 minute review timer on slide 23. Participants assess trade, currency, diversification, AI competition, budget priorities and expected data rules according to their objectives. Some signals are uncertain or opportunities; relevance does not automatically mean higher risk.
11. Release internal evidence. Slides 24–25 show strategy reports, audit findings and automated planning indicators. CA requires confirmation before capture. Every risk has three source-linked teaching records, sharing its underlying assumption event.
12. Review dashboards on slide 26; load actual aggregate outcomes in the owner browser. A justified neglect or unchanged assessment is valid. Close with the SPIT/SIPT direction and a one-objective pilot.

Releases do not require every participant to finish. Decisions persist. Source changes apply to unreleased batches, never silently deleting reviewed evidence.

## Mobile walkthrough and deck

Nine read-only mobile guides at `/audience/walkthrough/<key>` render the **same React components and strategic scenario data** as the audience app. They create no guest session or database records. The deck embeds them in portrait phone frames, with looping steps and automatic scroll to the relevant fields. Keys: context, menus, capture, assessment, mitigation, protection, internal, ca, dashboard.

Guides run only on their active slide, can pause manually and pause during editing or hidden tabs. Reduced-motion users start paused. The original-news slide uses an attributed source photograph and transcribed headline, not a claimed browser screenshot.

Slide 4 loops the evidence paths with static handoff questions. Slide 12 loops evidence → human review → score → response. Fullscreen retains the slide footer while hiding navigation controls. The cover remains simple; the research slides and Carillion case remain intact.

## Evidence boundaries

- Profiles, exposure percentages, KPI targets, scores and internal documents are teaching assumptions for fictional companies.
- External article URLs and original publication dates are real. The shared guided record and wider pack live under `website/assets/data/`.
- Rule-based matching requires strategic-driver and exposure term groups. It explains a candidate relationship; participants verify product coverage, contracts, customers, assumptions and controls. No language model is connected.
- Historical articles use the visible exercise date; live articles use the current review window. Old/future/invalid dates cannot silently become fresh evidence.
- One event can have several sources. Corroboration does not accumulate likelihood points. Keep/customize/update require explicit decisions.
- Mitigation uses the strongest declared reduction per dimension rather than adding overlapping claims. Approval/completion alone does not change the assessment. Implementation evidence enables a later review.
- CA indicators reconcile numerator and denominator with exception references. They assess configured strategic planning cases, not a connected production system.
- KPI actuals are not supplied. Scores never imply a predicted KPI percentage or achieved performance improvement.

## Persistence and checks

Version-3 `/api/workshop` sessions use local PostgreSQL with owner checks, workspace isolation, row locks, ordered releases and decision history. Existing session records remain in the database; superseded application APIs are not included.

Run `npm --prefix app test` and `npm --prefix app run build`. Checks include strategic relevance, historical dates, uncertain/opportunity signals, denominator reconciliation, owner-only release, source selection, evidence/assessment/plan decisions and tenant isolation. Physical-phone and projected visual checks are still needed in the event environment.

## Browser deck editing

The cover is intentionally simple: title, subtitle and session label. Other teaching slides retain their explanatory detail.

1. Open `/presentation/deck/` and select **Edit deck** in the top toolbar.
2. Click an object to select it, or choose it from **Slide objects**. Double-click text to type directly. The inspector also edits text, font size, weight, color, alignment and background.
3. Drag **Move** above the selection to reposition it, or drag the lower-right handle to resize. SVG labels and shapes can be selected individually; shapes expose fill and stroke, while size controls apply to images and whole diagrams. **Select slide background** changes the slide background.
4. Use **Undo**, **Redo** or **Reset selected object**. Ctrl/Cmd+S saves; Ctrl/Cmd+Z undoes inspector/object changes. The bottom Previous/Next controls remain available while editing.
5. Select **Done** or **Presentation mode** to return to normal presentation. Timed diagrams and mobile clips pause while editing and resume under their normal slide lifecycle afterward.

Changes save to this browser's local storage for this origin. They persist on reload but are not automatically written into repository files or shared with other browsers/devices. Use **Export edits** to download a JSON backup, then **Import edits** to restore it in another browser on the same deck revision. Source revisions are fingerprinted; incompatible files are rejected to avoid applying edits to the wrong objects. Imported values are validated and text is rendered as text, not executable HTML. Live counters, moving explanations and playback captions remain controlled by the presentation runtime.

The editor is intended for desktop authoring. Object offsets and dimensions are stored relative to the slide for resizing across viewports. Review both normal and fullscreen layouts after changing object positions or sizes; free movement can intentionally overlap other content. The local application and its database are not modified by deck edits.


## Survey evidence and research slides

Three research slides precede Carillion. `seminar-research.json` records the primary sources, checked date, methods and construct limitations. `seminar-research.js` creates the statistic graphics and research mechanism diagram; `deck-research.css` controls their layout. Each slide offers source links and an expandable study-scope explanation. The opening stays within its prior time allocation.

The quantitative findings concern strategic usefulness and alignment, not the percentage of organizations doing meaningless work. The qualitative paper and author interview describe how reporting can become compliance-oriented. None of these studies estimates Kemenkeu's performance, proves that AI improves outcomes, or establishes that all risk and assurance work is clerical. Mixed survey populations and dates are not presented as a trend. The PwC item is explicitly labeled as a business-executive subgroup result, separately from the full study sample.

The primary evidence includes NC State University/AICPA's 2026 study summary and release, PwC's 2023 web study and original PDF (alignment: page 19; overall sample: page 2), and Agarwal and Kallapur's 2021 journal abstract supplemented by the author's 2025 ISB interview. Paywalled full text was not used. These are separate evidence types; the current-source ledger identifies how each was verified.

If browser edits belong to an earlier deck structure, they are archived locally rather than applied to different objects. Edit mode exposes **Export previous revision edits** to retain a backup. New edits can then be made on the revised deck.
