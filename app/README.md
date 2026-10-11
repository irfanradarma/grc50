# HORI risk workspace

React + TypeScript + Vite frontend, with organization context, risk register, Risk Monitoring, and Risk Trigger. Local mode uses Express and PostgreSQL; cloud mode uses Supabase authentication, PostgreSQL row-level security, and an Edge Function for news capture. See [Supabase and GitHub Pages setup](../docs/supabase-github-pages.md).

Organization context contains two tabs. Company profile stores the enduring mandate, stakeholders, dependencies, and risk appetite. Objectives stores multiple annual objectives with a planning year, KPI, target, and accountable owner. Profile and objective saves are independent. Existing pre-tab objectives are preserved as 2026 annual entries. The risk register lets users choose a saved annual objective for new risks and sample generation; new entries retain its ID and planning year. Annual objective records also use forced tenant row policies.

First-time guests without a saved company profile enter a seven-step guided setup instead of the workspace form. The flow asks one question at a time, offers sector choices, supports Back and optional deferral, and includes an editable review before saving. Name and sector are required; the remaining context can be enriched later. A workspace-keyed sessionStorage draft restores answers and position after a refresh in the same tab. It is removed after successful profile save. Random sample setup also requires review and explicit saving. Completion opens Annual objectives; subsequent visits bypass setup and retain the editable Company profile tab.

New guests first choose **Use a template** or **Start from scratch**. The public-service template creates a private synthetic company profile, three annual objectives, four linked risks, five KRIs/readings, four trigger sources, sample reports, and review history. It opens Risk Monitoring immediately. Setup is transactional and restricted to an empty workspace; retries never duplicate or replace existing data. Scratch mode retains the guided company survey, remembers the choice across refresh, and offers Change starting option before saving. Existing profiles bypass this choice.

Selecting Other requires a custom sector description, which is preserved through review, refresh, and profile editing. The purpose, stakeholders, dependencies, and risk-appetite questions each offer Fill randomly. This changes only the current answer, leaves it editable, and uses sector-specific sample templates where available, with general templates for other sectors. Samples are not live AI outputs.

## Run

From `app/`:

```powershell
npm install
powershell -NoProfile -File scripts/start-local-db.ps1
npm run dev
```

Open http://127.0.0.1:5173. The API listens on loopback port 3001. The dedicated PostgreSQL instance listens on loopback port 5433. The existing Windows PostgreSQL service could not start, even after elevation. The fallback uses the installed PostgreSQL binaries and a separate app-owned cluster, without altering the installed service or its data.

Initial local provisioning, when needed: `npx tsx scripts/provision-local-db.ts`, then `npm run db:migrate`. Provisioning generates local credentials and writes the ignored `.env`; rerunning it rotates the app-local database password. It does not provision cloud resources.

## Guest access and isolation

Guest entry creates a new workspace and a cryptographically random session cookie. The server stores only the token hash. Cookies are HttpOnly and SameSite Strict; production cookies require HTTPS. A session lasts 30 days. Signing out revokes it. This prototype deliberately has no account/password login yet. Guest workspaces are not recoverable after logout, cookie loss, or expiration. Tabs in the same browser profile share its guest session; separate browsers or profiles receive separate sessions.

All context and risk queries derive tenant identity from the server session, never from a caller-supplied workspace ID. PostgreSQL forces row-level security on context and risks. The runtime role is neither superuser nor BYPASSRLS. Isolation separates data and session access within a shared application/database; it does not create a separate server process per guest.

## Risk workflow

Risk register entries select a saved annual objective. Use **Filter by objective** to narrow the register. Open a saved risk to configure any number of KRIs, or use **Indicators & readings** in Risk Monitoring. Each indicator has an owner, observation frequency, unit, deterioration direction, and warning/critical thresholds. Record dated readings; warning and critical observations create pending reassessment signals. Observation history retains the classification at recording time; dashboard status uses the latest observation and current thresholds.

**Risk Monitoring** lists every registered risk, indicator status, pending signals, and recorded risk reviews. Review signals with a decision and rationale. A reassessment request does not automatically change risk ratings: open the linked risk, update it, and record the completed review. Objective-level signals can lead to a new risk. Normal internal reports are retained as information in history.

**Risk Trigger** separates external and internal sources:

- External: public HTTPS RSS/Atom or JSON endpoints, plus manual article references. Capture runs on demand, checks comma-separated keywords, deduplicates by source/article URL (or title/date), and routes matching articles to monitoring. JSON accepts an array, or `articles`/`items`, with `title`, `summary`, `url`, and `publishedAt`. Empty keywords match all articles.
- Internal: periodic reports, incident reports, and a continuous assurance register with test/control rules, cadence, objective, optional target risk, and manually recorded test results.

Every source targets an objective and optionally a risk belonging to that objective. News requests are server-side, restricted to public addresses, with pinned DNS resolution, no redirects, an 8-second socket timeout, a 1 MB response cap, and at most 100 articles per capture. Credentials, scheduled collection, automated assurance connectors, and AI impact analysis are not implemented yet. The five additional workflow tables use forced tenant row-level security.

## Generation

Context and risk generation use random sample templates, as requested for v1. Risk samples incorporate the saved objective and dependencies. They are editable drafts and never saved automatically. No AI model, API key, fabricated source citation, or live external analysis is involved. Later AI integration can replace the generation module without changing the editor workflow.

## Checks

`npm run build` checks TypeScript and builds the frontend. `npm test` runs the PostgreSQL-backed isolation test with two independent guest sessions, unauthorized-write checks, persistence, forced row-policy checks, and logout revocation. Tests use disposable workspaces and clean them up.

## Supabase later

The SQL schema and transaction boundaries are in `server/`. Retain explicit tenant ownership when moving to Supabase. Replace the guest-session mechanism with Supabase anonymous authentication, add memberships if collaboration becomes necessary, and rewrite policies around the authenticated user or verified memberships. Merely pointing the database URL at Supabase will not migrate authentication or policy semantics. The server-side migration needs separate DDL credentials once the runtime role no longer owns schema objects.

Local files under `.local/`, `.env`, dependencies, and build output are ignored. Do not upload the local cluster or credentials. Google Fonts are loaded from the browser for the visual prototype, with system-font fallbacks.
