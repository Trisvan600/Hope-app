-- =====================================================================
-- S3-DBA-01  Views / queries: employee current job and department
--
-- Depends on 002 (employee, jobhistory, job, department, is_deleted).
--
-- Rule (guide section 3.5): every promotion, transfer or raise is a new
-- jobhistory row, and the row with the latest effective date that is not in
-- the future is the employee's current job.
--
-- View:
--   v_employee_current_job : one row per active employee with the current
--                            job and department.
--     * Employees who have left (sepdate is set) are still listed;
--       is_separated tells them apart. For the "Active Employees" report use
--       WHERE NOT is_separated.
--     * An employee with no job history gets NULL job and department.
--     * Salary and birth date are NOT included (personal data, guide section
--       3.5 and the Data Privacy Act note). A salary view, if needed, must be
--       limited to the users who have the Job History right.
--
-- The view uses the caller's permissions (security_invoker), so it follows
-- the row level security of employee, jobhistory, job and department.
-- Those tables have RLS on but no policy yet (008), so through the API the
-- view returns nothing until the Human Resources policies exist.
--
-- Indexes: speed up the "latest job of one employee" lookup and the checks
-- done by trg_check_children() when an employee, job or department is
-- soft-deleted.
--
-- NOTE: the migration runner already wraps this file in a transaction.
-- =====================================================================

-- 1. View -------------------------------------------------------------------
CREATE OR REPLACE VIEW v_employee_current_job
WITH (security_invoker = true) AS
SELECT e.empno,
       e.lastname,
       e.firstname,
       e.hiredate,
       e.sepdate,
       (e.sepdate IS NOT NULL) AS is_separated,
       h.jobcode,
       j.jobdesc,
       h.deptcode,
       d.deptname,
       h.effdate               AS job_effdate
FROM   employee e
LEFT JOIN LATERAL (
         SELECT x.jobcode, x.deptcode, x.effdate
           FROM jobhistory x
          WHERE x.empno = e.empno
            AND NOT x.is_deleted
            AND x.effdate <= (now() AT TIME ZONE 'Asia/Manila')::date
          ORDER BY x.effdate DESC, x.jobcode
          LIMIT 1
       ) h ON true
LEFT JOIN job        j ON j.jobcode  = h.jobcode
LEFT JOIN department d ON d.deptcode = h.deptcode
WHERE  NOT e.is_deleted;

-- 2. Indexes ----------------------------------------------------------------
-- Latest job of one employee (the primary key starts with empno but is
-- followed by jobcode, not by effdate)
CREATE INDEX IF NOT EXISTS idx_jobhistory_empno_effdate_active
    ON jobhistory (empno, effdate DESC) WHERE NOT is_deleted;

-- Foreign keys are not indexed automatically in PostgreSQL.
CREATE INDEX IF NOT EXISTS idx_jobhistory_deptcode
    ON jobhistory (deptcode);

CREATE INDEX IF NOT EXISTS idx_jobhistory_jobcode
    ON jobhistory (jobcode);

CREATE INDEX IF NOT EXISTS idx_sales_empno
    ON sales (empno);

-- =====================================================================
-- Quick checks (expected results with the sample data)
--   SELECT count(*) FROM v_employee_current_job;                    -- 32
--   SELECT empno, jobdesc, deptname FROM v_employee_current_job
--    WHERE empno IN ('00001','00007','00013','00039','00043','00057')
--    ORDER BY 1;
--     00001 Programmer 2   Information Tech
--     00007 Vice president Information Tech
--     00013 Vice president Sales Branch 1   (moved from Branch 2 in 2011-03)
--     00039 Clerk 2        Executive
--     00043 Supervisor     Executive        (the 2011-06-01 row wins)
--     00057 Programmer 1   Sales Branch 2
--   SELECT count(*) FILTER (WHERE NOT is_separated) AS active,
--          count(*) FILTER (WHERE is_separated)     AS separated
--     FROM v_employee_current_job;                                   -- 27 and 5
-- =====================================================================
