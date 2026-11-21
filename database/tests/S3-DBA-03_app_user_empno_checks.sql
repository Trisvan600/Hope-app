-- S3-DBA-03: Verify that app_user.empno is linked to employee
-- Every test statement is undone. No data is changed.
-- Tests 1-2 must be rejected by app_user_empno_fk. Tests 3-4 must be accepted.
-- Needs at least 1 row in app_user and 1 row in employee.

DROP TABLE IF EXISTS pg_temp.s3_dba_03_results;
CREATE TEMP TABLE s3_dba_03_results (test_no INT, test TEXT, result TEXT, detail TEXT);

DO $$
DECLARE
    t RECORD;
BEGIN
    FOR t IN
        SELECT * FROM (VALUES
            (1, 'Insert with empno not in employee is rejected', 'REJECT',
                $q$INSERT INTO app_user (email, full_name, role_code, is_blocked, is_deleted, empno)
                   VALUES ('s3dba03_a@test.local', 'S3 DBA03 A', (SELECT role_code FROM app_user LIMIT 1), false, false, '99999')$q$),
            (2, 'Update to empno not in employee is rejected', 'REJECT',
                $q$UPDATE app_user SET empno = '99999' WHERE user_id = (SELECT MIN(user_id) FROM app_user)$q$),
            (3, 'Insert with NULL empno is accepted', 'ACCEPT',
                $q$INSERT INTO app_user (email, full_name, role_code, is_blocked, is_deleted, empno)
                   VALUES ('s3dba03_b@test.local', 'S3 DBA03 B', (SELECT role_code FROM app_user LIMIT 1), false, false, NULL)$q$),
            (4, 'Insert with valid empno is accepted', 'ACCEPT',
                $q$INSERT INTO app_user (email, full_name, role_code, is_blocked, is_deleted, empno)
                   VALUES ('s3dba03_c@test.local', 'S3 DBA03 C', (SELECT role_code FROM app_user LIMIT 1), false, false, (SELECT empno FROM employee LIMIT 1))$q$)
        ) AS v(test_no, test_name, mode, stmt)
        ORDER BY v.test_no
    LOOP
        BEGIN
            EXECUTE t.stmt;
            RAISE EXCEPTION USING ERRCODE = 'P0099', MESSAGE = 'statement accepted (change undone)';
        EXCEPTION
            WHEN SQLSTATE 'P0099' THEN
                INSERT INTO s3_dba_03_results VALUES (t.test_no, t.test_name,
                    CASE WHEN t.mode = 'ACCEPT' THEN 'PASS' ELSE 'FAIL' END, SQLERRM);
            WHEN foreign_key_violation THEN
                INSERT INTO s3_dba_03_results VALUES (t.test_no, t.test_name,
                    CASE WHEN t.mode = 'REJECT' THEN 'PASS' ELSE 'FAIL' END, SQLERRM);
            WHEN OTHERS THEN
                INSERT INTO s3_dba_03_results VALUES (t.test_no, t.test_name, 'FAIL', 'unexpected error: ' || SQLERRM);
        END;
    END LOOP;
END;
$$;

SELECT test_no, result, test, detail FROM s3_dba_03_results ORDER BY test_no;
