# HORI progressive seminar workshop — local/LAN

The default app is the participant exercise. `?mode=presenter` opens session controls. Expert workspace apps remain in the Apps switcher or `?view=dashboard`.

## Start locally

From HORI:

```powershell
& ./app/scripts/start-local-db.ps1
npm --prefix app run dev
```

For the presentation, in another terminal:

```powershell
python -m http.server 8765 --bind 127.0.0.1
```

API and PostgreSQL remain on loopback. Vite listens on LAN and proxies API requests. Phones need the laptop's reachable Wi-Fi address on port 5173. No firewall or Supabase settings were changed automatically.

## Run the seminar

1. Open `http://localhost:5173/?mode=presenter`. Create a session; resume in the same browser using its URL. **New session** starts another audience without deleting earlier records.
2. Select **Capture news**. Inspect coverage/headlines. Up to twelve publisher/objective RSS queries feed the session. Failed/empty sources are visible; the set is fixed after release.
3. Select the network address and share the participant link/QR. Test one real phone on the event Wi-Fi.
4. Open `http://localhost:8765/website/deck/`. Paste the participant link on the QR slide and select **Show session QR**.
5. Participants name their company, choose an objective, 1–2 risks, and publishers. Randomizers help setup and rationale entry.
6. Release **External news**. Each participant receives at most six candidates from their objective/chosen sources. Selection favors publisher diversity and a contrast item where available.
7. Participants decide each signal, review affected risks, explicitly retain/update scores, and complete the round.
8. Release **Internal reports**, **Audit reports**, then **Continuous Assurance**. Monitor aggregate/per-round progress; participants keep their own pace.
9. Participants download decision records. A justified keep/neglect is a successful outcome.

## Persistence and isolation

`seminar_sessions` stores owner, release sequence, news and source health. Presenter mutations check ownership. `seminar_participants` stores each workspace's setup, inbox, scores and reviews and forces RLS. Participants access their own records; presenter routes return aggregate progress. Other workspaces cannot change presenter state or decide another company's signals.

Five-second polling distributes releases. Unchanged reads do not rewrite data. Release is ordered/idempotent. Inbox, assessment and completion have server gates. Explicit score changes are integers 1–5; history retains evidence IDs, before/after values, rationale and timestamps.

Workshop records are distinct from expert workspace organization/risk tables. They share private guest identity, not other participants' environments. Supabase Atlas is untouched.

## Validation and practical limits

- Twelve tests pass: four rounds, tenant isolation, objective/risk validation, early completion, duplicate decisions, update/keep persistence, CA confirmation.
- Frontend build and deck JavaScript checks pass. All 33 slides fit the normal viewport.
- Browser capture returned articles from all four publishers. RSS can be headline-only; full-article interpretation is not implemented.
- Browser QA completed a participant's four rounds, including capture, neglect, score update and retained scores. A different company/objective received another inbox via LAN. The actual app was checked in a 390px frame, with 375px usable width and no horizontal overflow.
- Physical-phone access and classroom-scale load remain unverified. Guest Wi-Fi isolation or firewall rules may prevent access.
- No push, deployment, cloud migration or Atlas settings change occurred. GitHub Pages can serve the deck, but multi-participant workshop mode requires a backend and must not be published as a static-only app.
