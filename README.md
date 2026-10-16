# Beyond Compliance

Using AI to capture signals for effective risk management: a 60-minute English presentation and progressive mobile workshop.

- [Seminar material and running order](docs/seminar-plan.md)
- [Presenter and LAN setup guide](docs/seminar-workshop.md)
- `website/deck/index.html`: final 33-slide HTML deck, diagrams, interactions and speaker notes.
- `app/`: participant journey, presenter controls, PostgreSQL persistence and automated tests. The Apps switcher also opens the detailed risk/assurance workspace.

## Run locally

```powershell
& ./app/scripts/start-local-db.ps1
npm --prefix app run dev
```

In another terminal:

```powershell
python -m http.server 8765 --bind 127.0.0.1
```

Open `http://localhost:5173/?mode=presenter` and `http://localhost:8765/website/deck/`. Share the LAN participant URL/QR from presenter controls. Phones need the same reachable network. Keep local `.env` and `.local/` private; they are excluded from Git.

News is collected from actual publisher RSS results. Interpretation currently uses explicit rules. Internal reports, audit extracts and CA inputs are prepared workshop evidence. The workflow records capture/neglect and explicit update/keep decisions; it does not claim a connected language model or live production integrations.

## Verification

```powershell
npm --prefix app test
npm --prefix app run build
```

## Publishing

GitHub contains the source. The manual **Publish seminar deck** Actions workflow publishes only `website/` to GitHub Pages. The hands-on app needs the local/LAN backend and is not a static-only Pages application. Existing Supabase Atlas settings are not part of this setup.

Retain [photo and icon credits](website/assets/images/CREDITS.md) with exported/published material.
