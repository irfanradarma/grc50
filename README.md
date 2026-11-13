# SIGNAL | Presentation platform

**Memaksimalkan Potensi AI dalam Mengawal Strategi dan Risiko Organisasi**

A presentation platform with an admin-managed topic library. Beyond Compliance is the initial complete topic, combining its 45-slide deck and the SIGNAL risk-management workshop.

- [Library topik presentasi dan aplikasi](docs/modul-dan-materi.md)
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

One shared seminar runs at `/audience/`, without join codes. Password-protected `/admin/` contains the deck and signal-release controls. Multiple signed-in admins share the current slide position; audiences may browse independently and return to live. Top/bottom controls appear near their respective edges. Move near the right edge for section and slide navigation.

The admin's **SIGNAL app demo** tab provides a dedicated participant-style workspace. **Show app to audience** broadcasts that window, cursor and actions over the audience deck; **Hide app** restores the last slide. See the presenter guide for operation and relay limits.

The deck covers AI in assurance, AI across the full risk cycle with mandatory human authority, the GRC integration gap, SIGNAL, the strategic hands-on case and SIPT's conceptual direction. The SIPT section does not show SIGNAL as a platform interface.

## Local design review

```powershell
./experiments/keynote/start-local.ps1
```

Open `http://127.0.0.1:8090/website/deck/?present=1`. Read-only desktop guides run locally through Vite on port 8091; no database is needed for this review.

## Full local app

```powershell
./app/scripts/start-local-db.ps1
node app/scripts/configure-admin.mjs # first setup, or after editing the private password file
npm --prefix app run dev
```

Open `http://localhost/admin` and `http://localhost/presentation/deck/`. The generated local password is in `app/.local/admin-password.txt`. Edit that private file, then run the setup script to regenerate its hash without replacing your chosen password; restart the API afterward. Keep `.env` and `.local/` private. Historical coded sessions are retained in the database but are not used by the shared seminar.

Participants choose an Indonesian organization and objectives, then review news, reports, audit evidence and continuous-assurance exceptions. Capture/neglect, reassessment and mitigation remain explicit human decisions. Current and projected scores stay separate. Relevance uses transparent rules; a language model and social connector are not connected. The ANTARA case replays the 3 April 2025 tariff announcement as of 8 April 2025, not as a current-rate claim.

## Verify and publish

```powershell
npm --prefix app test
npm --prefix app run build
node app/scripts/build-pages.mjs
```

The manual **Publish SIGNAL app and deck** workflow deploys the frontend and deck to Pages. Render hosts the API; an isolated SIGNAL schema and restricted role in Supabase persist data. See the deployment guide before changing cloud configuration. A new live-deck outline requires releasing the API as well as the frontend.

Retain [photo and icon credits](website/assets/images/CREDITS.md) in published material.

## New topic: AI in Audit and Beyond

A separate 45-slide RSM Indonesia topic presented by Dena Sucianandika and Teuku Raja Irfan Radarma, with primary research, English/Bahasa Indonesia content and presenter notes, and an audit workspace demonstration. Open `http://localhost/presentation/deck/?previewTopic=ai-audit-beyond` to preview without changing the active topic. The local AMS preview is at `http://localhost/audience/?previewTopic=ai-audit-beyond`. Activate the topic through **Admin > Library topik** when ready. [Material, source limitations and demonstration scope](docs/topics/ai-audit-and-beyond.md).

The narrative follows a brief chatbot/agent refresher and safeguards → Audit the AI → Audit with AI → useful applications → an integrated AMS → continuous risk assurance. A recurring sales-and-collections example links the sections. [Story and presenter transitions](docs/topics/ai-audit-narrative.md).

The opening has one animated computer/cloud lesson and one safeguard lesson. Confidential audit work and human authority are covered in the audit section. The local AMS supports annual planning, fieldwork, reviewed report/slide generation and an audit-signal handover to the same risk register. See the [daily-use facilitation guide](docs/topics/ai-data-handling.md).
