# API reference

The API is served by `server/src/app.ts` under `/api` on the same host and port as the web app (default 8080). It is used only by the SIMRS web app; there is no public or third-party API.

## Conventions

- Request and response bodies are JSON (`Content-Type: application/json`), at most 10 MB.
- Every endpoint except `GET /health` and `POST /auth/login` needs `Authorization: Bearer <token>`.
- Every authenticated request runs in one database transaction as the signed-in user, so row-level security applies (see [roles §5](02-users-and-roles.md#5-what-the-database-enforces)).
- Ids: users, classes and members are UUIDs; data records use the app's text ids (for example `P001`, `REG-...`).
- Messages are in Bahasa Indonesia.

### Errors

Errors return `{"error": "<message>"}` with:

| Status | When |
| --- | --- |
| 400 | Invalid input, invalid id, body not JSON, or a database check failed (message starts with the SQLSTATE, e.g. `23505: ...`) |
| 401 | Not signed in, wrong username or password, expired token, account inactive (on `/auth/me`) |
| 403 | Not allowed. Database permission refusals start with `42501:` so the app can tell them from network problems |
| 404 | Unknown route or unknown table name |
| 413 | Body too large, or more than 2 000 rows in one save |
| 429 | Too many failed logins (10 per username or 200 per IP in 15 minutes) |
| 500 | Unexpected server error (details only in the server log) |

## Health

### `GET /health`
Checks the database connection. No token needed.
Response `200 {"ok": true}`.

## Authentication

### `POST /auth/login`
Body `{"username": "20240306044", "password": "..."}`. Username is trimmed and lower-cased.

Response `200`:
```json
{
  "token": "<jwt>",
  "profile": { "id": "uuid", "username": "20240306044", "full_name": "Anwar Baskoro",
               "account_type": "mahasiswa", "must_change_password": true, "active": true },
  "classes": [ { "id": "uuid", "name": "RMIK 2024 A" } ]
}
```
Errors: 401 wrong credentials; 403 account inactive or in no class; 429 rate limit.

### `GET /auth/me`
Restores a session after reload. Response `200 {"profile": {...}, "session": {"id": 1, "class_id": "uuid", "role_id": "R09"} | null, "classes": [...]}`. 401 if the account is inactive.

### `POST /auth/password`
Body `{"password": "<new, at least 8 characters>"}`. Sets the password and clears `must_change_password`. Response `200 {"ok": true}`.

## Practice sessions

### `POST /practice-session`
Body `{"classId": "uuid", "roleId": "R09"}`. Ends any open session of the user (logging `LOGOUT`), opens a new one and logs `LOGIN`.
Response `200 {"id": 12, "class_id": "uuid", "role_id": "R09"}`.
Errors: 400 unknown role; 403 R01 without admin account, R03 without dosen or admin account, template class, or not an active member.

### `DELETE /practice-session`
Ends the open session and logs `LOGOUT`. Response `200 {"ok": true}`.

### `POST /events`
Body `{"action": "NAVIGATE", "entity": "Page", "entityId": "coding", "details": {"module": "coding"}}`. Writes a navigation event to the class audit log. Only `NAVIGATE` is accepted (403 otherwise).

## Practice roles

### `GET /practice-roles`
Response `200 [{"id": "R01", "name": "Super Admin", "access": ["all"]}, ...]`.

### `PUT /practice-roles/:id`
Admin only. Body `{"access": ["dashboard", "coding", ...]}`. Response `200 {"ok": true}`; 403 for non-admins; 400 if `access` is not a list of strings.

## Classes

### `GET /classes`
Classes the user may enter (admin: all except the template). Response `200 [{"id": "uuid", "name": "..."}]`.

### `POST /classes`
Dosen or admin. Body `{"name": "RMIK 2025 B"}`. Creates the class as a copy of the template; a dosen becomes its dosen member. Response `200 {"id": "uuid"}`.

### `POST /classes/:classId/reset`
Dosen of the class or admin. Replaces all class data with a fresh copy of the template and logs `RESET`. Response `200 {"ok": true}`.

### `GET /classes/:classId/members`
Response `200 [{"id": "uuid", "username": "...", "full_name": "...", "member_role": "mahasiswa", "active": true}]`, sorted by name. Visible to class members and admins.

### `PUT /classes/:classId/members/:userId`
Dosen of the class or admin; only admins change a dosen; nobody changes themselves. Body `{"active": false}`. Deactivation ends the member's open session in the class. Response `200 {"ok": true}`.

### `GET /classes/:classId/audit?after=<id>`
Latest 500 audit rows of the class, newest first; with `after`, only rows with a larger id. Response `200` list of [audit log rows](05-data-model.md#5-audit-log).

## Class data

`:table` must be one of the [19 class data tables](05-data-model.md#3-class-data-tables), otherwise 404.

### `GET /classes/:classId/data`
All tables of the class. Response `200 {"patients": [ {...}, ... ], "registrations": [...], ...}`; each list holds the `data` objects, newest first.

### `GET /classes/:classId/data/:table`
One table. Response `200 [ {...}, ... ]`.

### `POST /classes/:classId/data/:table`
Saves a change set, all or nothing.

```json
{
  "upserts": [ { "id": "P010", "noRM": "000123", "name": "Siti Aminah", "...": "..." } ],
  "deletes": [ "P007" ]
}
```

- Each upsert must be an object with a text `id`; it replaces the whole record with that id in the class.
- `deletes` is a list of ids.
- At most 2 000 rows in total (the app sends chunks of 500).
- Row-level security decides whether the user may write the table. Inserts or updates that are not allowed fail with `403 42501: ...`; a delete that removes fewer rows than asked is refused with `403 42501: hapus ditolak` and nothing is saved.

Response `200 {"ok": true}`.

## Accounts and rosters

### `POST /accounts/dosen`
Admin only. Body `{"username": "dsn.budi", "name": "Dr. Budi, M.Kes"}` (name up to 120 characters). Creates the account with a temporary password, or returns the existing one.

Response `200`:
```json
{ "accounts": [ { "username": "dsn.budi", "name": "Dr. Budi, M.Kes", "status": "created", "tempPassword": "Ab3dEf7hJk" } ] }
```
`tempPassword` is `null` for an existing account.

### `POST /classes/:classId/roster`
Active dosen of the class, or admin. Body `{"rows": [{"nim": "20240306101", "name": "Rina Lestari"}, ...]}`, 1 to 300 rows; NIM 3–40 characters of `0-9 a-z . _ -`.

For each row the server creates the student account if needed and adds it to the class. Rows are processed independently.

Response `200`:
```json
{ "accounts": [
  { "username": "20240306101", "name": "Rina Lestari", "status": "created",  "tempPassword": "Qw8rTy2uPz" },
  { "username": "20240306102", "name": "Dimas",        "status": "existing", "tempPassword": null },
  { "username": "dsn.wati",    "name": "Dr. Wati",     "status": "skipped",  "tempPassword": null, "message": "Akun ini bukan akun mahasiswa" },
  { "username": "20240306103", "name": "Tono",         "status": "failed",   "tempPassword": null, "message": "Gagal memproses baris ini" }
] }
```
Skip reasons: not a student account, already dosen of this class, inactive member (activate by hand). One `RosterImport` event is logged with counts.

## Command line (not HTTP)

`server/src/cli.ts`, run as `node server/dist/cli.js` (or `npm run db:migrate` / `npm run db:bootstrap` in development), needs `DATABASE_URL`:

| Command | Effect |
| --- | --- |
| `migrate [--no-seed]` | Apply new migrations and reload the template class from `db/seed.sql` |
| `bootstrap --admin-password <pw> [--admin-username admin] [--class "Kelas RMIK"] [--demo]` | Create the admin account and a first class; `--demo` also creates the preset demo accounts with their published passwords. Demo passwords are refused for the admin. |
