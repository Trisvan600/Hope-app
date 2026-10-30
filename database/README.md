# Database Setup (walang Docker)

Gabay ito para sa team ng HOPE app. Supabase (PostgreSQL) ang database namin, at gumagamit kami ng simpleng migration runner.

## Kailangan mo

- [Node.js](https://nodejs.org) (LTS)
- Access sa Supabase project (hingin sa DB Admin ang connection string)

## 1. Kunin ang connection string

1. Buksan ang Supabase project -> **Connect** (o Project Settings -> Database).
2. Piliin ang **Session pooler** (gumagana sa IPv4).
3. Kopyahin ang connection string at palitan ang `[YOUR-PASSWORD]` ng database password.

## 2. I-setup ang `.env`

```bash
cd database
cp .env.example .env
```

Buksan ang `.env` at ilagay ang totoong `DATABASE_URL`.

> **Huwag kailanman i-commit ang `.env`.** Public ang repo. Nasa `.gitignore` na ito, pero i-double check pa rin.

## 3. I-install at patakbuhin ang migrations

```bash
cd database
npm install
npm run migrate
```

Ang script ay:
- gumagawa ng `schema_migrations` table kung wala pa
- pinapatakbo ang mga `.sql` file sa `database/migrations/` ayon sa pangalan (`001_...`, `002_...`)
- nilalaktawan ang mga naipatakbo na
- nagro-rollback ng buong migration kung may error

Kapag walang bago: `No new migrations.`

## Magdagdag ng bagong migration

1. Gumawa ng file sa `database/migrations/` na may susunod na numero, hal. `002_hope_tables.sql`.
2. Huwag baguhin ang migration na naipatakbo na. Gumawa ng bago.
3. Mag-PR gaya ng nakasaad sa team guide.

## Pag may problema

| Problema | Solusyon |
|---|---|
| `Missing DATABASE_URL` | Wala pang `.env` o walang laman. Ulitin ang hakbang 2. |
| `ENOTFOUND` / hindi makakonekta | Gamitin ang **Session pooler** string, hindi ang Direct connection. |
| `password authentication failed` | Mali ang password. I-reset sa Supabase -> Database Settings. |
