# Managing Risk in the Era of AI

## Project layout

```text
HORI/
  README.md
  .gitignore
  docs/
    seminar-plan.md
  app/                         React/TypeScript SaaS prototype
    src/                       Frontend
    server/                    API, PostgreSQL schema, isolation tests
    scripts/                   Local database startup and provisioning
    supabase/                  Cloud migration, Edge Function, hosted RLS tests
  .github/workflows/pages.yml   Static app and seminar deck deployment
  website/
    index.html                 Website entry point
    deck/
      index.html               HTML presentation
    assets/
      css/deck.css
      js/deck.js               Slide content and presentation interactions
  sources/
    03 - Alat dan Teknik Audit AI.pdf
  tmp/
    pdfs/                      Extracted text and source-page previews
```

`website/` contains the static presentation website. `docs/` contains planning material. `sources/` preserves the original reference material. `tmp/` contains local working files and is excluded from version control.

The SaaS prototype now lives in `app/` as a separate development project. See [app/README.md](app/README.md) for startup and isolation details. Its local URL is http://127.0.0.1:5173. The static presentation remains in `website/`; production routing between them can be added later.

Supabase mode and a GitHub Pages workflow are now prepared. The workflow serves the app at the site root and the seminar presentation at `/deck/`. See [cloud setup and deployment](docs/supabase-github-pages.md) for the shared atlas project, authentication prerequisite, and publishing instructions.

## Local preview

From the project root, run:

```powershell
python -m http.server 8765 --bind 127.0.0.1
```

Visit `http://127.0.0.1:8765/website/` or directly `http://127.0.0.1:8765/website/deck/`. Alternatively, open `website/deck/index.html` directly in a modern browser.

## Presentation controls

The deck has 42 slides covering the complete seminar narrative. Use arrow keys, Page Up/Down, Home/End, the controls, or Contents to navigate. Press N to toggle speaker notes. Reading view shows all slides. Browser printing produces a landscape handout. Notes are hidden by default but are shipped in the client source, so they are not confidential.

The four embedded scenarios are browser-local, deterministic teaching interactions using synthetic data. They do not call AI services or connect to SIPT/CMCA, selfassess.id, or AMS. Scenario state resets when the demonstration reopens. The dedicated demonstration app and product integration remain future work.

## Source material and hosting

The local source PDF link resolves from `website/deck/` to the original file in `sources/`. Serve the project root for local access to both. For a later public release, publish the website code from `website/`, then replace that local reference with an approved public resource or explicitly package the approved PDF. Do not publish the entire workspace as the production website.

No hosting or deployment has occurred. The deck uses no remote fonts, packages, or service credentials. The material plan is in [docs/seminar-plan.md](docs/seminar-plan.md).
