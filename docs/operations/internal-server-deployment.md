# Deploying SIMRS-UEU on an internal Esa Unggul server

> The hosted demo project (simrs-ueu) was migrated via the Supabase MCP connector; its migration history versions differ from the file names, so never run `supabase db push` against it. Fresh databases use `db push --db-url` as below.

## What runs
1. **Supabase (self-hosted)**: Postgres, Auth, REST, Realtime, Edge Functions. Official guide: https://supabase.com/docs/guides/self-hosting/docker (Docker Compose, about 8–10 containers). Minimum: 4 vCPU, 8 GB RAM, 50 GB disk.
2. **The web app**: static files from `npm run build` (`dist/`) served by nginx or any static web server.

## Steps
1. Install Docker and Docker Compose on the server.
2. Follow the self-hosting guide; set strong `POSTGRES_PASSWORD`, `JWT_SECRET`, `ANON_KEY`, `SERVICE_ROLE_KEY`, `DASHBOARD_PASSWORD`.
3. In the Auth settings (`.env` of the Supabase stack): `DISABLE_SIGNUP=true`, `ENABLE_EMAIL_AUTOCONFIRM=true`.
4. From a checkout of this repository:
   - `npx supabase db push --db-url "postgresql://postgres:<pw>@<server>:5432/postgres" --include-seed`. The migrations include `20261009000500_audit_session_switch.sql`.
   - Copy `supabase/functions/import-roster` into the stack's `volumes/functions/` folder and restart the functions container. The function returns per-row statuses (`created|existing|skipped|failed`).
5. Bootstrap the first admin and class:
   `npm run bootstrap -- --env .env.bootstrap.local --admin-password '<strong>' --class "<nama kelas>"`
   where `.env.bootstrap.local` contains `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` of the internal stack. Do NOT use `--demo`.
6. Build the app with `VITE_SUPABASE_URL=<internal API URL> VITE_SUPABASE_ANON_KEY=<anon> VITE_DEMO_MODE=false npm run build` and serve `dist/` (SPA fallback to `index.html`).
   - Note: `LoginView` still pre-fills the demo NIM/password in its initial state. Before an internal deployment, set those initial values to empty (`src/views/LoginView.tsx`, the `useState('20240306044')` and `useState('mhs123')` lines).
7. Admin creates dosen accounts (`import-roster` action `create_dosen`); dosen create classes and import rosters in the app.

## Backups
`pg_dump` the `public` and `auth` schemas daily. `audit_log` is append-only by design; plan retention with the lab.

## If Supabase cannot be self-hosted
The schema, RLS and functions run on plain PostgreSQL. Auth, Realtime and the roster function would need a replacement API behind a third data-layer adapter (see spec §11, Option 2).
