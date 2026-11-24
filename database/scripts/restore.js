// S3-DBA-06 (part 2): restore script
// Restores a backup made by backup.js into an EMPTY LOCAL database.
// Safety: it refuses to run unless the target is on this computer (localhost),
// is not the same as DATABASE_URL, and has no tables yet. It never touches Supabase.
//
// Run from the database folder:  node scripts/restore.js [backup-file]
// Without a file name it uses the newest file in database/backups/.
// Needs: Node 18+, the PostgreSQL tools (psql, pg_restore) and, in database/.env:
//   RESTORE_DATABASE_URL=postgresql://postgres:LOCALPASSWORD@localhost:5432/hope_restore_test

'use strict';
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const DB_DIR = path.join(__dirname, '..');

function fail(msg) {
  console.error(msg);
  process.exit(1);
}

// Reads database/.env (KEY=VALUE lines) without any extra package.
function loadEnv() {
  const file = path.join(DB_DIR, '.env');
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (!m) continue;
    const value = m[2].replace(/^(['"])(.*)\1$/, '$2');
    if (process.env[m[1]] === undefined) process.env[m[1]] = value;
  }
}

// Finds a PostgreSQL tool: PG_BIN folder, the usual Windows folders, then PATH.
function findTool(name) {
  const exe = process.platform === 'win32' ? name + '.exe' : name;
  const dirs = [];
  if (process.env.PG_BIN) dirs.push(process.env.PG_BIN);
  if (process.platform === 'win32') {
    for (let v = 19; v >= 14; v--) dirs.push(`C:\\Program Files\\PostgreSQL\\${v}\\bin`);
  }
  for (const d of dirs) {
    const p = path.join(d, exe);
    if (fs.existsSync(p)) return p;
  }
  return name;
}

function run(tool, args) {
  const r = spawnSync(findTool(tool), args, { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 });
  if (r.error) {
    fail(`Could not run ${tool}: ${r.error.message}\nInstall PostgreSQL (Command Line Tools) or set PG_BIN in database/.env.`);
  }
  return r;
}

loadEnv();
const target = process.env.RESTORE_DATABASE_URL;
if (!target) fail('RESTORE_DATABASE_URL is missing. Put it in database/.env (local database only).');

// Safety checks: local database only, never the production one.
let host = '';
try {
  host = new URL(target).hostname;
} catch (e) {
  fail('RESTORE_DATABASE_URL is not a valid URL.');
}
if (!['localhost', '127.0.0.1', '[::1]', '::1'].includes(host)) {
  fail(`Refused: restore is only allowed to a local database (found host "${host}").`);
}
if (target === process.env.DATABASE_URL) {
  fail('Refused: RESTORE_DATABASE_URL is the same as DATABASE_URL.');
}

// Which backup file?
const dir = path.join(DB_DIR, 'backups');
let file = process.argv[2];
if (!file) {
  const all = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith('.dump')).sort() : [];
  if (!all.length) fail('No backup file found. Run node scripts/backup.js first.');
  file = path.join(dir, all[all.length - 1]);
}
if (!fs.existsSync(file)) fail(`Backup file not found: ${file}`);

// The target must be empty.
const q = run('psql', [
  `--dbname=${target}`, '-At', '-c',
  "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public'",
]);
if (q.status !== 0) fail(`${q.stderr}\nCannot connect to the restore database.`);
if (q.stdout.trim() !== '0') {
  fail(`Refused: the restore database is not empty (${q.stdout.trim()} tables in public).`);
}

// A backup does not contain extensions. If its indexes use pg_trgm, install it
// first, in the same schema the backup expects.
const ddl = run('pg_restore', ['--schema-only', '--no-owner', '--no-privileges', '--file=-', file]);
if (ddl.status !== 0) fail(`${ddl.stderr}\nCannot read the backup file.`);
const m = ddl.stdout.match(/([A-Za-z_][A-Za-z0-9_]*)\.g(?:in|ist)_trgm_ops/);
if (m) {
  console.log(`Installing pg_trgm in schema "${m[1]}"...`);
  const e = run('psql', [
    `--dbname=${target}`, '-v', 'ON_ERROR_STOP=1', '-c',
    `CREATE SCHEMA IF NOT EXISTS ${m[1]}; CREATE EXTENSION IF NOT EXISTS pg_trgm SCHEMA ${m[1]};`,
  ]);
  if (e.status !== 0) fail(`${e.stderr}\nCould not install pg_trgm.`);
}

console.log(`Restoring ${path.basename(file)} into the local database...`);
const r = run('pg_restore', ['--no-owner', '--no-privileges', `--dbname=${target}`, file]);
if (r.stderr.trim()) console.log(`pg_restore messages:\n${r.stderr.trim()}`);
console.log(r.status === 0 ? 'Restore finished without errors.' : 'Restore finished WITH errors (see messages above).');

// Exact row count of every table, to compare with the original database.
console.log('\nRows per table in the restored database:');
const counts = `
SELECT table_name,
       (xpath('/row/c/text()',
              query_to_xml(format('SELECT count(*) AS c FROM %I.%I', table_schema, table_name), false, true, '')))[1]::text AS row_count
FROM information_schema.tables
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
ORDER BY table_name`;
const c = run('psql', [`--dbname=${target}`, '-c', counts]);
console.log(c.status === 0 ? c.stdout : c.stderr);
process.exit(r.status === 0 ? 0 : 2);
