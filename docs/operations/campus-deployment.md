# Installing SIMRS-UEU on the Esa Unggul campus server

This guide is for the IT unit. SIMRS-UEU is a teaching hospital information system with synthetic data only.

## What runs

| Part | What it is |
| --- | --- |
| PostgreSQL 14 or newer | The campus PostgreSQL server. One database, for example `simrs`. |
| SIMRS app | One Node.js 20+ process (or one Docker container). It serves the web app and the API under `/api` on one port (default 8080). |
| Reverse proxy (optional) | nginx or similar for HTTPS and the public host name. |

The app needs no other services: logins, classes, rosters and the audit trail are all stored in PostgreSQL. Sizing for one class of about 50 students is small (1 vCPU and 1 GB RAM for the app).

## 1. Prepare PostgreSQL (DBA)

Run as a PostgreSQL superuser:

```sql
create role simrs_owner login password '<strong password>';
create database simrs owner simrs_owner;

-- The app switches to this role for every request, so row-level security applies.
create role simrs_user nologin;
grant simrs_user to simrs_owner;

-- Only needed if simrs_owner may not create extensions in the database:
\c simrs
create extension if not exists pgcrypto;
```

`simrs_owner` owns all SIMRS tables. It does not need superuser rights. If the DBA prefers, `simrs_owner` can instead be given `CREATEROLE`, and the first migration creates `simrs_user` itself.

`simrs_user` is a cluster-wide role name. Several SIMRS databases on one server (for example a training and a test copy) can share it.

## 2. Configure the app

Copy `.env.example` to `.env` (or set the same variables in the service manager):

| Variable | Value |
| --- | --- |
| `DATABASE_URL` | `postgres://simrs_owner:<password>@<db host>:5432/simrs` (add `?sslmode=require` if the server requires TLS) |
| `JWT_SECRET` | At least 32 random characters, e.g. `openssl rand -base64 48`. Changing it signs everyone out. |
| `PORT` | Port the app listens on (default `8080`). |
| `MIGRATE_ON_START` | `true` applies new database migrations each time the app starts. Set `false` to run them by hand (step 3). |
| `TRUST_PROXY` | Address of the reverse proxy that sets `X-Forwarded-For`, e.g. `10.0.0.5`. The default `loopback` fits nginx on the same machine. |
| `TOKEN_TTL` | Login session length (default `12h`). |

The build-time variables are set for you by the Docker image. For a build without Docker, use `VITE_API_URL=/api` and keep `VITE_DEMO_MODE=false` so the login screen shows no demo accounts.

## 3. Install and start

### Option A: Docker (recommended)

```bash
git clone https://gitlab.com/esaunggul/simrs-rmik.git && cd simrs-rmik
docker build -t simrs-ueu .
docker run -d --name simrs --restart unless-stopped --env-file .env -p 8080:8080 simrs-ueu
```

For a quick trial with its own PostgreSQL container, `docker compose up -d --build` starts both (see the top of `docker-compose.yml`).

### Option B: Node.js directly

```bash
git clone https://gitlab.com/esaunggul/simrs-rmik.git && cd simrs-rmik
npm ci
VITE_API_URL=/api npm run build      # web app  -> dist/
npm run server:build                 # API      -> server/dist/
set -a; . ./.env; set +a
node server/dist/cli.js migrate      # tables, security rules and the template class
node server/dist/index.js            # run under systemd, pm2 or similar
```

Only `dist/`, `server/dist/` and `db/` are needed at runtime; `node_modules` is not.

A systemd unit, for example:

```ini
[Service]
WorkingDirectory=/opt/simrs-rmik
EnvironmentFile=/opt/simrs-rmik/.env
ExecStart=/usr/bin/node server/dist/index.js
Restart=always
User=simrs
```

## 4. Create the first admin and class

Once, after the first start:

```bash
# Docker
docker exec -it simrs node server/dist/cli.js bootstrap --admin-password '<strong password>' --class "Kelas RMIK"
# Node.js
node server/dist/cli.js bootstrap --admin-password '<strong password>' --class "Kelas RMIK"
```

This creates the `admin` account and a first class copied from the template data. Do not pass `--demo` on the campus server: it creates the published demo accounts.

Then sign in as `admin` in the browser:

1. *Hak Akses & Pengguna* → *Kelas & Roster* → *Buat Akun Dosen* creates lecturer accounts. Each gets a temporary password, which must be changed at first login.
2. Lecturers create their classes and import student rosters (NIM and name) in the same tab, and give students the temporary passwords from the exported CSV.
3. *Master Data SIMRS* (admin only) manages rooms, beds, doctors and clinics per class.

## 5. Reverse proxy (HTTPS)

```nginx
server {
  listen 443 ssl;
  server_name simrs.esaunggul.ac.id;
  # ssl_certificate ...;
  client_max_body_size 20m;
  location / {
    proxy_pass http://127.0.0.1:8080;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

If nginx runs on another machine, set `TRUST_PROXY` to its address, so failed-login limits apply per student rather than per proxy.

## 6. Checks

- `curl http://<host>:8080/api/health` returns `{"ok":true}`.
- Signing in as `admin` shows the dashboard.

## 7. Updates

```bash
git pull
docker build -t simrs-ueu . && docker rm -f simrs && docker run -d --name simrs --restart unless-stopped --env-file .env -p 8080:8080 simrs-ueu
```

With `MIGRATE_ON_START=true`, new migrations in `db/migrations/` apply on start. Applied migrations are recorded in `simrs_meta.schema_migrations` and never run twice. Each start also reloads `db/seed.sql`, which only rewrites the template class that new classes are copied from; class data and role settings are kept.

## 8. Backups

Run a daily dump of the whole database, which includes the `public`, `auth` and `simrs_meta` schemas:

```bash
pg_dump -Fc -d simrs -f simrs-$(date +%F).dump
```

Restore with `pg_restore -d simrs --clean simrs-<date>.dump` into a database prepared as in step 1. The audit log (`public.audit_log`) is append-only by design, so agree on a retention period with the laboratory.

## Security notes

- Passwords are stored as scrypt hashes in `auth.users`. Login tokens are signed with `JWT_SECRET`.
- Failed logins are limited per username (10 per 15 minutes) and per client address (200 per 15 minutes; a computer lab often shares one address).
- Every write goes through row-level security as the signed-in user. Students only see their own class, and the audit log cannot be edited or deleted, not even by the app's own role.
