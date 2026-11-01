require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { Client } = require("pg");

const MIGRATIONS_DIR = path.join(__dirname, "..", "migrations");

async function run() {
  if (!process.env.DATABASE_URL) {
    console.error("Missing DATABASE_URL. Copy .env.example to .env and fill it in.");
    process.exit(1);
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();

  // Table na nagtatala kung anong migrations ang tapos na
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const { rows } = await client.query("SELECT filename FROM schema_migrations");
  const applied = new Set(rows.map((r) => r.filename));

  const files = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  let count = 0;
  for (const file of files) {
    if (applied.has(file)) continue;

    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), "utf8");
    console.log(`Running ${file}...`);

    try {
      await client.query("BEGIN");
      await client.query(sql);
      await client.query("INSERT INTO schema_migrations (filename) VALUES ($1)", [file]);
      await client.query("COMMIT");
      count++;
    } catch (err) {
      await client.query("ROLLBACK");
      console.error(`Failed on ${file}:`, err.message);
      await client.end();
      process.exit(1);
    }
  }

  console.log(count === 0 ? "No new migrations." : `Done. Applied ${count} migration(s).`);
  await client.end();
}

run();
