# SIGNAL seminar: strategic risk hands-on

The bilingual deck and three-organization app follow [the seminar plan](seminar-plan.md). Participants challenge growth assumptions, market choices, business models and investment commitments using real news and authored internal evidence. Current risk, projected protection and measured KPI achievement remain separate.

## Start locally

```powershell
& ./app/scripts/start-local-db.ps1
npm --prefix app run dev
```

| Purpose | Address |
|---|---|
| Presenter | http://localhost/admin |
| Audience | http://localhost/audience |
| Deck | http://localhost/presentation/deck/ |
| Admin password | app/.local/admin-password.txt (local private file) |

Vite listens on LAN and proxies the loopback API and presentation. Phones need the laptop's reachable Wi-Fi address on port 80. No firewall/cloud changes are made automatically.

## Presenter sequence

1. Sign in at `/admin` with the admin password. Share the `/audience/` link or QR from **Signals & participants**. No session code is needed.
2. Introduce AI in audit and assurance, the GRC disconnect and SIGNAL.
3. Ask participants to choose an organization and objective. Inspect initial risks, plans and source selection.
4. Show the real ANTARA tariff announcement and compare organizational exposure.
5. Release the guided news item. Walk through link approval/decline, optional capture notes, explicit score review and an owned mitigation decision.
6. Show the first-case dashboard. Do not wait for everyone to complete the flow.
7. Prepare the wider external batch. The verified strategic pack is the dependable default; live RSS remains a separate inspected option.
8. Release External, then Internal evidence. The app permits this immediately after the preceding stage is released; no participant-completion gate applies.
9. On **Keep exploring. We continue with SIPT.**, let participants review at their own pace. Proceed directly to the SIPT section. No timed work period or group debrief.
10. Explain SPIT/SIPT, RP as the shared risk-register reference, CMCA as a mainstream continuous-monitoring route, and AI-assisted evidence review with human authority.
11. Use the CA and internal-evidence desktop guides as presenter-led illustrations. Do not stop for a second audience exercise. These show the SIGNAL review pattern, not actual Kemenkeu platform screens.
12. Explain the integrated information flow, the illustrative institutional case and the effective-early-warning outcome. Close on contributions from management, UKI, Itjen and data/technology teams.

Participants may keep working during or after the talk. Decisions persist; releases do not require every participant to finish. Capture never changes a score automatically, and approving a plan does not establish effective protection.

## Desktop walkthrough and deck

Nine read-only desktop guides at `/audience/walkthrough/<key>` render the **same React components and strategic scenario data** as the audience app. They create no guest session or database records. The deck embeds them in desktop frames, with four deliberately paced scenes, highlighted controls and animated tap cues. Keys: context, menus, capture, assessment, mitigation, protection, internal, ca, dashboard.

Guides run only on their active slide, can pause manually and pause during editing or hidden tabs. Loops start by default; CSS respects reduced-motion preferences for decorative effects. The original-news slide shows cropped screenshots of the original ANTARA headline/photo and opening article paragraphs.

Slide 5 loops the evidence paths with static handoff questions. Slide 9 presents the looping SIGNAL framework. Fullscreen retains the slide footer while hiding navigation controls. The deck has no timing estimates or countdown, and no corporate-collapse case.

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

One shared version-3 seminar uses PostgreSQL with password-protected admin control, participant workspace isolation, row locks, ordered releases and decision history. Existing session records remain in the database; superseded application APIs are not included.

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

Three research slides lead directly into SIGNAL. `seminar-research.json` records the primary sources, checked date, methods and construct limitations. `seminar-research.js` creates the statistic graphics and research mechanism diagram; `deck-research.css` controls their layout. Each slide offers source links and an expandable study-scope explanation.

The quantitative findings concern strategic usefulness and alignment, not the percentage of organizations doing meaningless work. The qualitative paper and author interview describe how reporting can become compliance-oriented. None of these studies estimates Kemenkeu's performance, proves that AI improves outcomes, or establishes that all risk and assurance work is clerical. Mixed survey populations and dates are not presented as a trend. The PwC item is explicitly labeled as a business-executive subgroup result, separately from the full study sample.

The primary evidence includes NC State University/AICPA's 2026 study summary and release, PwC's 2023 web study and original PDF (alignment: page 19; overall sample: page 2), and Agarwal and Kallapur's 2021 journal abstract supplemented by the author's 2025 ISB interview. Paywalled full text was not used. These are separate evidence types; the current-source ledger identifies how each was verified.

If browser edits belong to an earlier deck structure, they are archived locally rather than applied to different objects. Edit mode exposes **Export previous revision edits** to retain a backup. New edits can then be made on the revised deck.

## Live slide following

1. Sign in at `/admin`. The **Presentation** tab contains the live deck, **Start presenting / Stop presenting**, and Previous/Next/Fullscreen controls. Presenting is off until an admin explicitly starts it; existing saved slide positions do not automatically start a presentation.
2. Other admins sign in with the same admin password in their own browsers. All controllers see the same current slide, including after reload; opening a panel does not reset the deck.
3. Share the ordinary **Audience deck** link. No guest account or code is needed to view slides. Click **Start presenting** when ready. Audience members follow by default while presenting and can browse independently or return to live. **Stop presenting** pauses automatic slide following and immediately suppresses browsing reminders without resetting the current slide. Any admin may start or stop the shared presentation; the status survives reloads and backend restarts.
4. Change slides with the panel buttons, the deck's keyboard navigation, Contents or the progress bar. Concurrent Next/Previous requests operate on the latest shared position. An outdated absolute jump restores the latest position rather than overwriting another admin.
5. Use **Signals & participants** to release evidence and review aggregate progress while the shared deck position remains available.

The current position is polled approximately every second. Only authenticated admins can publish. The public endpoint returns slide metadata, revision and timestamp, never participant records or rationale. Passwords and admin tokens never enter deck URLs.

When an independently browsing participant is on a different slide, a dialog offers **Go to presenter slide** or **Keep browsing independently**. Choosing to keep browsing (or pressing Escape) postpones the next reminder by 90 seconds. Presenter changes during that period do not restart or bypass the cooldown. Returning to the same slide clears it. Reminders wait while another dialog or the live app demonstration is open, and are not shown to embedded admin controllers. The dialog follows the deck's English/Indonesian language selection.

## Signal review and response

Click a signal summary to expand it. Approve or decline the proposed risk links; capture notes are optional. Capture opens the affected risk assessment. The suggested map cell stays marked while users explore alternatives. Accepting a suggestion records its rationale; custom scores and retained scores require a user rationale. Above-tolerance assessments prompt an owned mitigation proposal. Declines persist for that assessment, and saved actions retain projected protection separately from current exposure.

## Live application demonstration

1. Open **SIGNAL app demo** in the admin panel. Its dedicated workspace uses the same organization setup, dashboard, Risk Monitoring and Risk Trigger as the participant app. Prepare it before broadcasting; its records are excluded from participant totals.
2. Click **Show app to audience**. Audience decks show the app in a large overlay with the last slide blurred behind it. Cursor movement, clicks, scrolling and form changes are relayed live. Only this demo window is shared, not the admin panel or other browser tabs.
3. Work inside that window. One admin controls a broadcast at a time; other admins can see its status and stop it. Shared slide navigation pauses during the demonstration to preserve the background slide.
4. Click **Hide app** to return audience decks to that slide. The demo workspace remains available. A participant can also choose **Back to slides** locally and reopen with **Watch live app** while broadcasting continues.

Both frontend and API must be released for this feature. The relay keeps only a bounded recent DOM snapshot and event buffer in server memory, with no persistent recording or new database tables. A server restart ends the broadcast; a disconnected presenter expires after approximately 20 seconds. Reopen **Show app to audience** after reconnecting. The relay supports the current single backend instance.

## Opening agenda and guided demonstrations

The five agenda sections are: AI in audit & assurance; The disconnect; The SIGNAL model; Lead the decision; SIPT: Kemenkeu's direction. The four SupTech opening slides belong to the first section; the GRC foundations and research begin the second. Chapter buttons jump to each section and track the active section throughout the deck.

The nine walkthroughs use the real mobile components in a read-only route. Each has four focused scenes defined in `app/shared/walkthrough.ts`. Targeted framing replaces arbitrary pixel scrolling; a blue outline and tap cue show the control or evidence being discussed. The phone viewport is larger and captions state the current action. Pause, previous, next and replay controls sit outside the phone. Manual stepping pauses playback; Replay restarts the loop. Only the active slide loads its demonstration. These are guided live views, not prerecorded video files, and require the running local app. No participant records are created or modified.

The speaker introduction is slide 2, between the cover and agenda. Reza Rizky Pratama appears on the left and Teuku Raja Irfan Radarma on the right. Both portraits use transparent backgrounds with distinct colored halos; Reza's cutout is a separate derivative, with the original retained. No biographies or professional titles were supplied. Agenda is now slide 3; semantic live-following keys remain stable.

Each of the five agenda sections now begins with a numbered separator, with its own color, icon and transition question. Agenda/chapter buttons land on these separators. Semantic keys preserve live following when slide numbers change. The deck now contains 42 slides.

## SIPT narrative and source boundaries

The last chapter replaces the generic pilot section. RP/CMCA functions and their intended AI-enabled relationship come from the presenter's briefing. RP is the single risk-register reference; CMCA supplies continuous evidence linked to registered risks; internal and external sources complement it. AI relates and explains signals and drafts review options; the risk owner approves assessments and actions. Feedback supports the next monitoring cycle. This is the intended institutional direction, not an assertion that these AI integrations are already in production.

SIPT is expanded as Sistem Informasi Pengendalian Terintegrasi in BaTii's 2025-2029 strategy, printed page 10. PMK 83/2024 establishes the SPIT framework. The DJKN article dated 28 July 2025 provides public context for early warning, current risk profiles and integrated oversight. The worked institutional example is illustrative, not an actual incident, official score or deployed check.

### Institutional framework overview

Slide 33 displays a static image of the redrawn presenter-supplied SPIT framework after the SPIT/SIPT definition and before Risk Platform. It retains the foundation/principles, three-line roles, operational systems, Tigalini applications and intended outcomes. English labels are explanatory. CMCA and Risk Platform are highlighted for the next slides. The abbreviated KMK 6/2025 reference follows the supplied graphic; no additional legal interpretation is asserted. The deck has 42 slides, with semantic keys retained for live following.

Slide 33 now uses a single static framework image without a visible adaptation caption. The nine read-only walkthroughs render at 1280 x 800 with desktop navigation and run at 2.8 seconds per step (formerly 5.2). The participant app remains responsive on phones and desktops.

Slide 32 invites continued risk-manager role-play after the wider signals are released. It explains SIGNAL value through dynamic assessment, responsive action, connected objective/risk evidence and accountable human judgment, then bridges to Kemenkeu's SPIT direction without a timed audience break.
