## Running modes

- **Local mode (default, used in AI Studio):** no environment variables. Data lives in the browser.
- **Supabase mode:** set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (see `.env.example`). Data is shared per class in Postgres; logins, roles and the audit trail are enforced by the database.

## Working with AI Studio (important)

- Pull from GitHub (Settings → GitHub → Pull) before every AI Studio session.
- Never use "Force push".
- Screens talk to data only through `useApp()`; do not edit `src/data-layer/`, `src/lib/` or `supabase/` from AI Studio.
