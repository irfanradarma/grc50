# HORI on the shared Supabase project and GitHub Pages

Target project: `atlas` (`cjtslwxdkxqjechddxbk`). Reusing one project for multiple apps uses the same PostgreSQL database; HORI adds its own `hori_` tables. Storage, compute, quotas and project-level authentication settings are shared.

## Cloud database

The additive migration is `app/supabase/migrations/202610110001_hori.sql`. It creates:

- `hori_workspaces` and `hori_profiles`
- `hori_objectives` and `hori_risks`
- `hori_kris` and `hori_readings`
- `hori_sources`, `hori_signals` and `hori_reviews`

All tables force row-level security. Workspace identity equals the authenticated user's UUID; access policies compare it to `auth.uid()`. Unauthenticated clients have no table privileges. Composite foreign keys prevent cross-workspace links. Readings and reviews are append-only for browser clients. Database triggers derive objective snapshots, classify KRI readings, and insert breach signals within the reading transaction.

The browser uses Supabase anonymous authentication for credential-free guest entry. **Allow anonymous sign-ins** was enabled under Authentication → Sign In / Providers with the project owner's approval. This is a shared project setting. HORI uses a separate browser storage key (`hori-cloud-session`), so it does not replace the previous app's Supabase session. Signing out or losing browser storage ends access to a guest workspace. Existing local PostgreSQL data is not automatically uploaded.

First entry offers a complete synthetic public-service template or the existing guided scratch setup. `202610110002_workspace_template.sql` adds the `hori_seed_template` transaction function. It runs with the caller's RLS permissions, locks their workspace, creates new UUIDs for all linked records, and refuses to modify a workspace with existing profile/objective/risk data. The same manifest is used locally and in Supabase (`app/shared/workspaceTemplate.ts`).

Never run `supabase config push` with this checkout: it could replace the shared project's settings. The small `app/supabase/config.toml` is for deploying HORI's function only. Do not use `db reset`, migration repair, or broad schema pushes against the shared project. This migration was applied as a scoped SQL file; reapplying it would fail on existing table names and roll back.

## News capture

`hori-news` is a Supabase Edge Function. The handler validates the bearer token with Supabase Auth and uses that user's RLS context; it never uses a service-role key for data access. Gateway legacy JWT verification is disabled because the handler performs explicit authentication for current signing keys.

Hosted capture accepts HTTPS endpoints on trusted hostnames: `feeds.bbci.co.uk` and `feeds.npr.org` initially. Other RSS/JSON hosts need an administrator to configure `HORI_NEWS_ALLOWED_HOSTS` (comma-separated) in the function environment. Reference URLs and manually submitted articles can use other sources. Capture enforces public DNS addresses, no redirects, an 8-second timeout, a 1 MB response limit, 100 items per run, and a 15-second interval per source. News relevance uses keywords; AI analysis and scheduling are not implemented.

## Build and publish

The frontend has two modes. Without both `VITE_SUPABASE_*` values, it uses the existing local Express API. With them, it uses Supabase and requires no Express server on GitHub Pages.

For a local cloud build in PowerShell:

```powershell
cd app
$env:VITE_SUPABASE_URL = 'https://cjtslwxdkxqjechddxbk.supabase.co'
$env:VITE_SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_VlbeoEvMpj9Rce7mbfHe7g_oWLyX3Ee'
npm run build
npx vite preview --host 127.0.0.1 --port 4173
```

These are public browser configuration values. Do not put a service-role key, database password, or Supabase management token in Vite variables or GitHub Pages.

`.github/workflows/pages.yml` builds the app and adds the seminar deck at `/deck/`. Assets use relative paths, supporting a repository subpath such as `/grc50/`. Set the GitHub repository's Settings → Pages → Source to **GitHub Actions**, then run **Publish HORI to GitHub Pages**. The workflow defaults to the `main` branch. If this replaces an existing workflow, review that site's scope first.

The deployment repository is `irfanradarma/grc50`. The original Windows working folder remains the local development workspace. A separate checkout under ignored `tmp/publish-grc50` is used to publish reviewed source files without including `.env`, database data, dependencies, or intermediate files. The reference PDF is retained locally; the deployment includes the rendered seminar deck.

## Validation

`npm run build` validates TypeScript and bundles either mode. `npm test` exercises the local database. `supabase db query --linked --file supabase/tests/isolation.sql` validates hosted tenant isolation, foreign references, objective snapshots and automatic KRI signals using fixtures that roll back.
