// database/scripts/test-audit-user.js   (task S1-DBA-06)
//
// Checks that audit_user() records the logged-in APP user in audit_log.
// Usage (from the database/ folder):  node scripts/test-audit-user.js
//
// Everything runs inside one transaction that is ROLLED BACK at the end,
// so no test data is left in employee or audit_log.
require("dotenv").config();
const { Client } = require("pg");

async function lastAudit(client) {
  const { rows } = await client.query(
    "SELECT action, record_key, action_by FROM audit_log ORDER BY audit_id DESC LIMIT 1"
  );
  return rows[0];
}

(async () => {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();

  let ok = false;
  try {
    await client.query("BEGIN");

    // 1. No app user set: audit_user() falls back to the database login.
    await client.query("UPDATE employee SET firstname = 'AuditTest1' WHERE empno = '00001'");
    console.log("Without app.username ->", await lastAudit(client));

    // 2. App user set for this transaction only (what the backend should do).
    await client.query("SELECT set_config('app.username', $1, true)", ["test.user"]);
    await client.query("UPDATE employee SET firstname = 'AuditTest2' WHERE empno = '00001'");
    const withUser = await lastAudit(client);
    console.log("With app.username    ->", withUser);

    const { rows } = await client.query("SELECT stamp FROM employee WHERE empno = '00001'");
    console.log("employee.stamp       ->", rows[0].stamp);

    ok = withUser.action_by === "test.user" && rows[0].stamp.includes("test.user");
  } finally {
    await client.query("ROLLBACK");
    await client.end();
  }

  console.log(
    ok
      ? "PASS: audit_user() records the app user. (test data rolled back)"
      : "FAIL: audit_user() did not record the app user. (test data rolled back)"
  );
  process.exit(ok ? 0 : 1);
})().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});

