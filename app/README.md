# HORI seminar application

React/TypeScript/Vite, Express and PostgreSQL. Follow the [LAN operating guide](../docs/seminar-workshop.md) and [seminar plan](../docs/seminar-plan.md).

The default page is the participant exercise. `/admin` creates and controls sessions; `/audience` joins; `/presentation/deck/` serves the HTML presentation through the same local origin. New sessions use the revised three-organization journey. Earlier sessions remain stored.

## Local setup

Install dependencies with `npm ci` from this directory. On an existing configured workstation, run `scripts/start-local-db.ps1`, then `npm run dev`. For a new local database, review and run `npx tsx scripts/provision-local-db.ts` to provision local credentials before starting the app. Keep `.env` and `.local/` private.

`npm test` runs persistence, tenant-isolation, evidence-review and assessment tests against local PostgreSQL. `npm run build` verifies TypeScript and creates the frontend bundle. The frontend bundle alone does not provide the seminar backend.

The app starts on port 5173, its loopback API on 3001 and the app-local database on 5433. Guest sessions retain each participant's own setup and decisions. Read the guide before using the app with an audience.
