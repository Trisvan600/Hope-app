-- =====================================================================
-- S3-DBA-05 : HR demo data checks
-- READ-ONLY: this file contains SELECT statements only.
-- No INSERT / UPDATE / DELETE. Safe to run in the Supabase SQL Editor.
-- Baseline: database/migrations/002_hope_base_tables.sql
--   official rows -> department 8, job 14, employee 32, jobhistory 54
-- =====================================================================

-- 1. Row counts: official vs total vs active ---------------------------
SELECT 'department' AS tbl, 8  AS official,
       count(*) AS total, count(*) FILTER (WHERE NOT is_deleted) AS active
  FROM department
UNION ALL
SELECT 'job', 14, count(*), count(*) FILTER (WHERE NOT is_deleted) FROM job
UNION ALL
SELECT 'employee', 32, count(*), count(*) FILTER (WHERE NOT is_deleted) FROM employee
UNION ALL
SELECT 'jobhistory', 54, count(*), count(*) FILTER (WHERE NOT is_deleted) FROM jobhistory;

-- 2. Departments not in the official list ------------------------------
SELECT deptcode, deptname, is_deleted, stamp
  FROM department
 WHERE deptcode NOT IN ('ACT','BR1','BR2','EXC','HRD','IT','PAY','WHS');

-- 3. Jobs not in the official list -------------------------------------
SELECT jobcode, jobdesc, is_deleted, stamp
  FROM job
 WHERE jobcode NOT IN ('PRES','VP','MGR','SA1','SA2','SPVR','CLK1','CLK2',
                       'PR1','PR2','ANYS','ACCT','WMAN','HRS');

-- 4. Employees beyond the official 00001-00063 -------------------------
SELECT empno, lastname, firstname, hiredate, sepdate, is_deleted, stamp
  FROM employee
 WHERE empno > '00063'
 ORDER BY empno;

-- 5. Jobhistory rows beyond the official data --------------------------
SELECT empno, jobcode, effdate, salary, deptcode, is_deleted, stamp
  FROM jobhistory
 WHERE empno > '00063'
    OR jobcode NOT IN ('PRES','VP','MGR','SA1','SA2','SPVR','CLK1','CLK2',
                       'PR1','PR2','ANYS','ACCT','WMAN','HRS')
    OR deptcode NOT IN ('ACT','BR1','BR2','EXC','HRD','IT','PAY','WHS')
 ORDER BY empno, effdate;

-- 6. Active employees with no active jobhistory ------------------------
SELECT e.empno, e.lastname, e.firstname, e.hiredate, e.sepdate
  FROM employee e
 WHERE NOT e.is_deleted
   AND NOT EXISTS (SELECT 1 FROM jobhistory j
                    WHERE j.empno = e.empno AND NOT j.is_deleted);

-- 7. Active jobhistory pointing to a deleted employee, job or dept -----
SELECT j.empno, j.jobcode, j.deptcode
  FROM jobhistory j
  LEFT JOIN employee   e ON e.empno    = j.empno
  LEFT JOIN job        b ON b.jobcode  = j.jobcode
  LEFT JOIN department d ON d.deptcode = j.deptcode
 WHERE NOT j.is_deleted
   AND (e.empno IS NULL OR e.is_deleted
     OR b.jobcode IS NULL OR b.is_deleted
     OR d.deptcode IS NULL OR d.is_deleted);

-- 8. Employees with 2 or more active jobhistory (official = 19) --------
SELECT empno, count(*) AS jh_count
  FROM jobhistory
 WHERE NOT is_deleted
 GROUP BY empno
HAVING count(*) >= 2
 ORDER BY empno;

-- 9. Every soft-deleted HR row -----------------------------------------
SELECT 'department' AS tbl, deptcode AS record_key, stamp FROM department WHERE is_deleted
UNION ALL
SELECT 'job', jobcode, stamp FROM job WHERE is_deleted
UNION ALL
SELECT 'employee', empno, stamp FROM employee WHERE is_deleted
UNION ALL
SELECT 'jobhistory', empno || '|' || jobcode || '|' || effdate, stamp
  FROM jobhistory WHERE is_deleted;

-- 10. Audit trail of the HR tables, newest first -----------------------
SELECT audit_id, table_name, action, record_key, action_by,
       action_at AT TIME ZONE 'Asia/Manila' AS action_at_ph
  FROM audit_log
 WHERE table_name IN ('department','job','employee','jobhistory')
 ORDER BY audit_id DESC
 LIMIT 100;
