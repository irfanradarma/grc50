# SIGNAL public hosting

Frontend and deck: GitHub Pages (`https://irfanradarma.github.io/grc50`). API: Render Free in Singapore. Database: the existing Atlas Supabase project, in the separate, unexposed `signal` schema.

## Isolation

`deploy/supabase-signal-bootstrap.sql` creates four new tables and the restricted `signal_app` login. It refuses to overwrite existing SIGNAL objects. It does not alter Atlas tables, policies, credentials, Auth configuration, exposed API schemas or Realtime publications. The app role has no superuser, create-role, create-database or RLS-bypass privileges. Anonymous and authenticated Supabase API roles have no SIGNAL schema access. The API uses at most three database connections.

The live bootstrap was applied on 20 October 2026. Existing table permission/RLS and policy fingerprints matched before and after; Realtime publication membership count was unchanged. This verifies those metadata boundaries, not a multiplayer gameplay test. Both apps still share project compute, connection and storage quotas.

## Backend

Use the repository-root build/start commands in `render.yaml`. Set the new SIGNAL-only password yourself; never reset the Atlas/project password. Store its session-pooler URI only in Render's `DATABASE_URL` secret. Use port 5432 and TLS certificate verification. Do not use the `postgres` role. Production startup refuses a schema other than `signal`, refuses a database user other than `signal_app`, and checks provisioning without running automatic DDL.

Required non-secret settings: `NODE_ENV=production`, `DATABASE_SCHEMA=signal`, `DB_POOL_MAX=3`, `FRONTEND_ORIGINS=https://irfanradarma.github.io`, `PUBLIC_FRONTEND_URL=https://irfanradarma.github.io/grc50`. Render supplies `PORT`; the API binds to `0.0.0.0`. Health check: `/api/health`. Automatic backend deploy is off so updates can be checked before release.

Production uses the public Supabase root CA in `app/server/certs/supabase-prod-ca-2021.crt` with `verify-full`, retaining hostname verification. Source: https://supabase-downloads.s3-ap-southeast-1.amazonaws.com/prod/ssl/prod-ca-2021.crt . SHA-256 fingerprint: `807025AD50D4ED219D2C9C7D299C004F824EB00CF7F65AFEF607D07B72E6CAFA`; expires 26 April 2031. This is a public trust certificate, not a credential.

Deployment verified on 20 October 2026: GitHub Pages run `39416130648` succeeded; Render is live on commit `c8d4452`. Verified TLS and SIGNAL-only password authentication both succeeded. Public API smoke checks passed for three independent guests, presenter ownership, guided relevance, capture without notes, reassessment, mitigation creation and completion, external/internal releases, private evidence documents and live slide publication. Browser checks confirmed the public admin, audience entry, cover and looping desktop walkthrough. All 25 repository tests and the production build passed. A presenter session was created in the user's browser for immediate use.

Render Free sleeps after inactivity. Open and test the service ahead of the webinar. Data persists in Supabase, not the Render filesystem.

## Frontend and deck

`deploy/public-config.json` contains only public URLs. `node app/scripts/build-pages.mjs` builds React for the repository base path and packages the deck, QR view and nine read-only guides into `app/.local/pages`. Publish through the manually triggered **Publish SIGNAL app and deck** workflow. No `.env`, database URL, password, node_modules or local database is in the Pages artifact.

- Admin: `/grc50/admin/`
- Audience: `/grc50/audience/`
- One shared seminar: no session query or code; older session links canonicalize to the role route.
- Deck: `/grc50/presentation/deck/` (`/grc50/deck/` remains compatible)

Participant workspaces use random, hashed bearer credentials retained by the participant browser. This avoids dependence on third-party cookies between Pages and Render. Do not share a presenter browser profile or its stored credentials. The API allows only the configured frontend origin, and admin authorization is enforced on the server. Admin login uses a scrypt password hash, rate-limited attempts and individually revocable eight-hour tokens stored only in the browser tab session. A guest token cannot publish slides or release signals.

## Release checks

Run `npm --prefix app test`, `npm --prefix app run build` and `node app/scripts/build-pages.mjs`. After deployment, verify API health, distinct guest workspaces, presenter session creation, participant joining, source release, relevance review, reassessment, mitigation, internal documents, live slide following and read-only guide playback. Keep Atlas checks read-only; do not apply the local public-schema migration to its database.

## Shared control-room release

Configure `ADMIN_PASSWORD_HASH` in Render before releasing this version. Apply the password in the private `app/.local/admin-password.txt` file using `node app/scripts/configure-admin.mjs`; the password and Render-ready hash are saved in ignored `app/.local/` files. Copy the hash from `admin-password-hash.txt` into Render (not the plaintext password). The script reuses the chosen password and existing hash when unchanged; on first setup it generates a password if no file exists. Password changes invalidate previously issued admin tokens. Restart the API after configuration changes. Missing configuration fails closed with HTTP 503. Do not publish either private file.

The API initializes one SIGNAL room using the existing isolated SIGNAL tables; no schema migration or Atlas changes are needed. Existing historical rooms remain untouched. Release the API before Pages because the frontend now uses `/presentation/live`, `/admin/presentation` and `/admin/presentation/navigate`. All controllers read the same revision. Next/previous operations are serialized in PostgreSQL; an outdated absolute slide jump receives HTTP 409 and the latest position. Signal releases preserve the presentation state.

The live app demo additionally uses authenticated `/admin/demo/*` endpoints and the public SSE `/demo/stream` relay. Only the deliberately presented demo document is sent, including its visible form inputs and cursor; passwords are masked. Admin controls and credentials are not recorded. The relay is ephemeral, bounded and intended for one backend instance. It expires after 20 seconds without presenter heartbeats. No database migration is required. The Pages builder packages the self-hosted rrweb replay library in both deck asset roots; release the API before publishing the updated Pages artifact.
