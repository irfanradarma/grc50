# SIGNAL Keynote design study — promoted

The approved design now lives in `website/assets/keynote/` with its primary entry at `website/deck/index.html`. This directory retains the first 44-slide local study as a design backup; its entry redirects to the current deck. The original editorial production deck is separately backed up at `website/deck-archive/` and with a Git tag documented in `docs/deck-versions.md`.

Run `./experiments/keynote/start-local.ps1` from the repository root. Open `http://127.0.0.1:8090/website/deck/?present=1`.

`serve.py` serves the repository for local review and proxies `/_app/` to the read-only Vite guides on port 8091. It binds only to loopback. Full participant sessions continue to use the existing app/backend, or the public Admin.

The remaining `keynote.js`, `keynote.css`, `reference.json` and `snapshot.mjs` here are the first study, not production sources. Do not edit them expecting to change the primary deck. This directory is excluded from Pages packaging.
