# SIMRS Esa Unggul

A teaching hospital information system (SIMRS) for RMIK students at Universitas Esa Unggul. All data is synthetic.

## Running modes

- **Local mode (default, used in AI Studio):** no environment variables. Data lives in the browser.
- **Server mode:** the Node.js API in `server/` with PostgreSQL. Build the web app with `VITE_API_URL=/api`. Data is shared per class, and logins, role access and the audit trail are enforced by the database.

Guides:

- [Installing on the campus server](docs/operations/campus-deployment.md) (IT unit)
- [Development](docs/operations/development.md)
- [Demo walkthrough](docs/operations/demo-walkthrough.md)

Quick trial with Docker: `cp .env.example .env`, set `POSTGRES_PASSWORD` and `JWT_SECRET`, then `docker compose up -d --build` and open http://localhost:8080 after the bootstrap step in the campus guide.

## Working with AI Studio (important)

- Pull from GitHub (Settings → GitHub → Pull) before every AI Studio session.
- Never use "Force push".
- Screens talk to data only through `useApp()`; do not edit `src/data-layer/`, `src/lib/`, `server/` or `db/` from AI Studio.
