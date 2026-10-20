ï»¿# SIGNAL | Beyond Compliance: Memaksimalkan Potensi AI dalam Mengawal Strategi dan Risiko Organisasi

Using AI to capture signals for effective risk management: an English presentation and progressive mobile workshop.

- [Seminar material and running order](docs/seminar-plan.md)
- [Presenter and LAN setup guide](docs/seminar-workshop.md)
- `website/deck/index.html`: 44-slide English deck with policy references, diagrams, a shared news case, QR joining and actual session outcomes.
- `app/`: participant journey, presenter controls, PostgreSQL persistence and automated tests. Admin and audience use separate route paths.

## Run locally

```powershell
& ./app/scripts/start-local-db.ps1
npm --prefix app run dev
```

Open `http://localhost/admin` and `http://localhost/presentation/deck/`. Audience entry is `http://localhost/audience`. Create a new session for this version and share its LAN audience URL/QR. Phones need the same reachable network. Keep local `.env` and `.local/` private; they are excluded from Git.

Participants choose from three Indonesian organizations and one or more objectives, then use Dashboard, Risk Monitoring and Risk Trigger. Guided news, live publisher RSS, internal documents and CA exceptions lead to explicit capture/neglect, assessment and mitigation decisions. Current and projected residual risk remain separate. Interpretation uses explicit rules; a language model and social connector are not connected. Internal sources use teaching evidence.

## Verification

```powershell
npm --prefix app test
npm --prefix app run build
```

## Publishing

GitHub contains the source. The manual **Publish seminar deck** Actions workflow publishes only `website/` to GitHub Pages. The hands-on app needs the local/LAN backend and is not a static-only Pages application.

Retain [photo and icon credits](website/assets/images/CREDITS.md) with exported/published material.

## Strategic hands-on case

Create a new session in `/admin` for scenario version 3. The three companies now face strategic growth, market concentration, capital allocation and business-model risks. The shared case is ANTARA's 3 April 2025 US tariff-announcement report, explicitly replayed as of 8 April 2025. It is not a current-rate claim. Use **Load strategic case news** for the verified eight-article pack; **Capture current strategic news** remains a separate RSS mode. Earlier sessions remain preserved.

The current deck uses nine read-only mobile views built from the audience app components. See [the presenter guide](docs/seminar-workshop.md) for the full sequence and evidence boundaries.

The agenda begins with AI in audit and assurance, then narrows to the SIGNAL risk-management exercise. Mobile demonstrations include focused scenes, tap cues, progress, pause, step and replay controls.

After the guided ANTARA case, release the external and internal signals and continue immediately into SIPT. Participants explore in parallel; there is no timed review break. The final section explains RP, CMCA, AI-assisted human review and the intended early-warning direction described by the presenter.
