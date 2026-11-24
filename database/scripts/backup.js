// S3-DBA-06 (part 2): backup script
// Makes a backup file of the database (public schema) with pg_dump.
// It only READS the database. The file is saved in database/backups/, and git
// ignores that folder because the backup contains real data.
//
// Run from the database folder:  node scripts/backup.js
// Needs: Node 18+, the PostgreSQL tools (pg_dump) and DATABASE_URL in database/.env
// Use the Supabase "Session pooler" connection string (port 5432), not port 6543.

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

loadEnv();
const url = process.env.DATABASE_URL;
if (!url) fail('DATABASE_URL is missing. Put it in database/.env (see .env.example).');

const dir = path.join(DB_DIR, 'backups');
fs.mkdirSync(dir, { recursive: true });
// The backup folder protects itself: git ignores everything inside it.
fs.writeFileSync(path.join(dir, '.gitignore'), '*\n!.gitignore\n');

const pad = (n) => String(n).padStart(2, '0');
const d = new Date();
const stamp =
  `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-` +
  `${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
const file = path.join(dir, `hope-backup-${stamp}.dump`);

console.log('Backing up (read only)...');
const r = spawnSync(
  findTool('pg_dump'),
  ['--format=custom', '--schema=public', '--no-owner', '--no-privileges', `--file=${file}`, `--dbname=${url}`],
  { encoding: 'utf8' }
);

if (r.error) {
  fail(`Could not run pg_dump: ${r.error.message}\nInstall PostgreSQL (Command Line Tools) or set PG_BIN in database/.env.`);
}
if (r.status !== 0) {
  fs.rmSync(file, { force: true });
  fail(`${r.stderr}\nBackup FAILED.`);
}

const kb = Math.round(fs.statSync(file).size / 1024);
console.log(`Backup OK: ${file} (${kb} KB)`);
