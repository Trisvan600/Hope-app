# HOPE App: Database Setup (no Docker)

This folder holds everything for the team database: the migration files, the migration runner script, and this guide.

Our database is a **hosted Supabase (Postgres) project**. Nobody needs Docker or a local database. Everyone connects to the same cloud database with a connection string.

> **This repo is public.** Never commit passwords, connection strings, or `.env` files. Real credentials are shared privately by the DB Admin.

---

## What you need

- **Node.js 18 or newer** (check with `node -v`)
- **Git** and a copy of this repo (or download it as a ZIP from GitHub)
- The **connection string** from the DB Admin (see below)
- Optional: `psql` or any SQL client (DBeaver, TablePlus)

---

## 1. Get the connection string

Ask the DB Admin for `DATABASE_URL` in a **private message** (not the group chat, not an issue, not a PR comment).

It looks like this (placeholders only):

```
postgresql://postgres.PROJECT_REF:YOUR_PASSWORD@aws-0-REGION.pooler.supabase.com:5432/postgres
```

Notes:

- It must be the **Session pooler** string: host contains `pooler.supabase.com`, port `5432`.
- Do **not** use the "Direct connection" string (`db.xxxx.supabase.co`). It is IPv6-only and fails on many home and campus networks.
- If a password contains special characters (`@ # / : ?`), they must be percent-encoded. The DB Admin should use letters and numbers only to avoid this.

---

## 2. Set up your machine

Run these from the **`database/`** folder:

```bash
cd database
npm install
```

Create your local `.env` file from the template:

```bash
# macOS / Linux / Git Bash
cp .env.example .env

# Windows PowerShell or Command Prompt
copy .env.example .env
```

Open `.env` and paste the connection string:

```
DATABASE_URL=postgresql://postgres.PROJECT_REF:YOUR_PASSWORD@aws-0-REGION.pooler.supabase.com:5432/postgres
```

`.env` is listed in `.gitignore`, so it will not be committed. Double-check with `git status` before every commit.

---

## 3. Run the migrations

From the `database/` folder:

```bash
npm run migrate
```

The runner:

1. Connects using `DATABASE_URL`.
2. Creates a `schema_migrations` table (first run only) to remember which files were applied.
3. Applies every new `.sql` file in `migrations/`, in filename order, each inside a transaction.
4. Stops and rolls back that file if it fails.

Expected output:

```
applied 001_init.sql
migrations up to date
```

Running it again is safe. Files already applied are skipped and you will only see `migrations up to date`.

---

## 4. Look at the database

- **Supabase dashboard:** Table Editor to browse tables, SQL Editor to run queries. Ask the DB Admin to invite you to the Supabase organization.
- **psql:** `psql "$DATABASE_URL"` (on Windows, paste the full string in quotes instead of `$DATABASE_URL`).
- **GUI client:** create a new PostgreSQL connection using the host, port `5432`, database `postgres`, and the user and password from the connection string.

---

## 5. Adding a new migration (DB Admin and anyone with a DB task)

1. Create a new file in `migrations/` with the next number and a short name:
   ```
   migrations/002_base_tables.sql
   migrations/003_app_user_and_rights.sql
   ```
2. Write plain SQL in the file.
3. Run `npm run migrate` to apply it.
4. Open a pull request. One task = one PR, and the PR title starts with the Task ID (for example `S1-DBA-02 ...`).

**Rules**

- Never edit a migration that was already applied and merged. Add a new numbered file instead.
- Filenames must sort in the right order (`001_`, `002_`, `003_`, ...).
- No passwords, tokens, or personal data inside SQL files.
- Seed data must not contain plain-text passwords. Use one-time set-password links.

---

## Troubleshooting

| Problem | Likely cause and fix |
| --- | --- |
| `ENOTFOUND` or connection times out | You used the Direct connection string. Use the **Session pooler** string. |
| `password authentication failed` | Wrong password, or special characters not percent-encoded. Ask the DB Admin for the correct string or a password reset. |
| `Tenant or user not found` | The user must look like `postgres.PROJECT_REF`, not just `postgres`. Re-copy the string. |
| Connects to `127.0.0.1`, or `client password must be a string` | `.env` is missing, misnamed, or not in the `database/` folder. Check the file is named exactly `.env`. |
| `Cannot find module 'pg'` | Run `npm install` inside the `database/` folder. |
| `failed 00X_...sql: ...` | There is an error in that SQL file. It was rolled back, so nothing was half-applied. Fix the SQL and run again. |
| `.env` shows up in `git status` | Stop. Do not commit. Check that `.gitignore` lists `.env`. |

If you accidentally commit a password or connection string, tell the DB Admin and the Scrum Master **immediately**. Deleting the file is not enough because it stays in Git history. The password must be reset.

---

## Folder layout

```
database/
├── migrations/      numbered .sql files, applied in order
├── scripts/
│   └── migrate.js   migration runner
├── .env.example     template (no real values)
├── .gitignore
├── package.json     `npm run migrate`
└── README.md        this guide
```
