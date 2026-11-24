-- =====================================================================
-- S3-DBA-02: Verify that jobhistory rejects duplicate effective dates
--
-- Verification script only: no schema change, and no data is changed.
-- Every statement below is expected to be REJECTED by the unique index
-- jobhistory_empno_effdate_uq (or by the primary key).
-- If a statement is unexpectedly accepted, it is undone and reported as FAIL.
--
-- How to run: paste the whole file in the Supabase SQL Editor and run it.
-- Expected result: every row of the final table says PASS.
-- =====================================================================

DROP TABLE IF EXISTS pg_temp.s3_dba_02_results;

CREATE TEMP TABLE s3_dba_02_results (
    test_no INT,
    test    TEXT,
    result  TEXT,
    detail  TEXT
);

DO $$
DECLARE
    t RECORD;
BEGIN
    FOR t IN
        SELECT * FROM (VALUES
            (1, 'Same employee, same effective date, different job code is rejected',
                format('INSERT INTO jobhistory (empno, jobcode, effdate, salary, deptcode) VALUES (%L, %L, %L, %s, %L)',
                       '00001', 'MGR', '2010-05-11', 50000, 'IT'),
                'duplicate key value violates unique constraint "jobhistory_empno_effdate_uq"%'),
            (2, 'Same employee, same job code, same effective date is rejected',
                format('INSERT INTO jobhistory (empno, jobcode, effdate, salary, deptcode) VALUES (%L, %L, %L, %s, %L)',
                       '00001', 'PR1', '2010-05-11', 48000, 'IT'),
                'duplicate key value violates unique constraint%'),
            (3, 'Changing an effective date to one already used by the same employee is rejected',
                format('UPDATE jobhistory SET effdate = %L WHERE empno = %L AND jobcode = %L AND effdate = %L',
                       '2010-05-11', '00001', 'PR2', '2010-12-01'),
                'duplicate key value violates unique constraint "jobhistory_empno_effdate_uq"%')
        ) AS v(test_no, test_name, stmt, expected)
        ORDER BY v.test_no
    LOOP
        BEGIN
            EXECUTE t.stmt;
            -- Reached only if the statement was accepted: undo it and report FAIL.
            RAISE EXCEPTION USING ERRCODE = 'P0099',
                                  MESSAGE = 'statement was NOT rejected (change undone)';
        EXCEPTION
            WHEN SQLSTATE 'P0099' THEN
                INSERT INTO s3_dba_02_results VALUES (t.test_no, t.test_name, 'FAIL', SQLERRM);
            WHEN OTHERS THEN
                IF SQLERRM LIKE t.expected THEN
                    INSERT INTO s3_dba_02_results VALUES (t.test_no, t.test_name, 'PASS', SQLERRM);
                ELSE
                    INSERT INTO s3_dba_02_results VALUES (t.test_no, t.test_name, 'FAIL',
                                                          'unexpected error: ' || SQLERRM);
                END IF;
        END;
    END LOOP;
END;
$$;

SELECT test_no, result, test, detail
FROM s3_dba_02_results
ORDER BY test_no;
