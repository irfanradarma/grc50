# SIGNAL public hosting

Frontend and deck: GitHub Pages (`https://irfanradarma.github.io/grc50`). API: Render Free in Singapore. Database: the existing Atlas Supabase project, in the separate, unexposed `signal` schema.

## Isolation

`deploy/supabase-signal-bootstrap.sql` creates four new tables and the restricted `signal_app` login. It refuses to overwrite existing SIGNAL objects. It does not alter Atlas tables, policies, credentials, Auth configuration, exposed API schemas or Realtime publications. The app role has no superuser, create-role, create-database or RLS-bypass privileges. Anonymous and authenticated Supabase API roles have no SIGNAL schema access. The API uses at most three database connections.

The live bootstrap was applied on 20 October 2026. Existing table permission/RLS and policy fingerprints matched before and after; Realtime publication membership count was unchanged. This verifies those metadata boundaries, not a multiplayer gameplay test. Both apps still share project compute, connection and storage quotas.

## Backend

Use the repository-root build/start commands in `render.yaml`. Set the new SIGNAL-only password yourself; never reset the Atlas/project password. Store its session-pooler URI only in Render's `DATABASE_URL` secret. Use port 5432 and TLS certificate verification. Do not use the `postgres` role. Production startup refuses a schema other than `signal`, refuses a database user other than `signal_app`, and checks provisioning without running automatic DDL.

Required non-secret settings: `NODE_ENV=production`, `DATABASE_SCHEMA=signal`, `DB_POOL_MAX=3`, `FRONTEND_ORIGINS=https://irfanradarma.github.io`, `PUBLIC_FRONTEND_URL=https://irfanradarma.github.io/grc50`. Render supplies `PORT`; the API binds to `0.0.0.0`. Health check: `/api/health`. Automatic backend deploy is off so updates can be checked before release.

Render Free sleeps after inactivity. Open and test the service ahead of the webinar. Data persists in Supabase, not the Render filesystem.

## Frontend and deck

`deploy/public-config.json` contains only public URLs. `node app/scripts/build-pages.mjs` builds React for the repository base path and packages the deck, QR view and nine read-only guides into `app/.local/pages`. Publish through the manually triggered **Publish SIGNAL app and deck** workflow. No `.env`, database URL, password, node_modules or local database is in the Pages artifact.

- Admin: `/grc50/admin/`
- Audience: `/grc50/audience/`
- Session: `/grc50/audience/?session=ABC234`
- Deck: `/grc50/presentation/deck/` (`/grc50/deck/` remains compatible)

Sessions use random, hashed bearer credentials retained by the participant browser. This avoids dependence on third-party cookies between Pages and Render. Do not share a presenter browser profile or its stored credentials. The API allows only the configured frontend origin, and session ownership is enforced on the server.

## Release checks

Run `npm --prefix app test`, `npm --prefix app run build` and `node app/scripts/build-pages.mjs`. After deployment, verify API health, distinct guest workspaces, presenter session creation, participant joining, source release, relevance review, reassessment, mitigation, internal documents, live slide following and read-only guide playback. Keep Atlas checks read-only; do not apply the local public-schema migration to its database.
