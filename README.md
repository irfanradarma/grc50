# SIGNAL | Beyond Compliance

**Memaksimalkan Potensi AI dalam Mengawal Strategi dan Risiko Organisasi**

An English Keynote-style presentation and connected risk-management workshop.

- [Deck and version backups](docs/deck-versions.md)
- [Deployment and database isolation](docs/deployment.md)
- [Presenter and workshop guide](docs/seminar-workshop.md)
- `website/deck/index.html`: primary 45-slide presentation.
- `website/assets/keynote/`: current visual content, styles and source notes.
- `website/deck-archive/`: archived 44-slide editorial presentation.
- `app/`: separate Admin and Audience routes, workspace isolation and persistence.

## Public access

- [Admin](https://irfanradarma.github.io/grc50/admin/)
- [Audience](https://irfanradarma.github.io/grc50/audience/)
- [Deck](https://irfanradarma.github.io/grc50/presentation/deck/)
- [Archived deck](https://irfanradarma.github.io/grc50/presentation/deck-archive/)

Create a presenter session in Admin. Its presenter deck leads the audience's session-linked deck; audiences may browse independently and return to live. Top/bottom controls appear near their respective edges. Move near the right edge for section and slide navigation.

The deck covers AI in assurance, AI across the full risk cycle with mandatory human authority, the GRC integration gap, SIGNAL, the strategic hands-on case and SIPT's conceptual direction. The SIPT section does not show SIGNAL as a platform interface.

## Local design review

```powershell
./experiments/keynote/start-local.ps1
```

Open `http://127.0.0.1:8090/website/deck/?present=1`. Read-only desktop guides run locally through Vite on port 8091; no database is needed for this review.

## Full local app

```powershell
./app/scripts/start-local-db.ps1
npm --prefix app run dev
```

Open `http://localhost/admin` and `http://localhost/presentation/deck/`. Keep `.env` and `.local/` private.

Participants choose an Indonesian organization and objectives, then review news, reports, audit evidence and continuous-assurance exceptions. Capture/neglect, reassessment and mitigation remain explicit human decisions. Current and projected scores stay separate. Relevance uses transparent rules; a language model and social connector are not connected. The ANTARA case replays the 3 April 2025 tariff announcement as of 8 April 2025, not as a current-rate claim.

## Verify and publish

```powershell
npm --prefix app test
npm --prefix app run build
node app/scripts/build-pages.mjs
```

The manual **Publish SIGNAL app and deck** workflow deploys the frontend and deck to Pages. Render hosts the API; an isolated SIGNAL schema and restricted role in Supabase persist data. See the deployment guide before changing cloud configuration. A new live-deck outline requires releasing the API as well as the frontend.

Retain [photo and icon credits](website/assets/images/CREDITS.md) in published material.
