-- =====================================================================
-- S2-DBA-04: Verify child-record delete checks for customer and product
--
-- Verification script only: no schema change, and no data is changed.
-- Every statement below is expected to be REJECTED by the triggers from
-- 002_hope_base_tables.sql (trg_check_children, trg_block_hard_delete).
-- If a statement is unexpectedly accepted, it is undone and reported as FAIL.
--
-- How to run: paste the whole file in the Supabase SQL Editor and run it.
-- Expected result: every row of the final table says PASS.
-- =====================================================================

DROP TABLE IF EXISTS pg_temp.s2_dba_04_results;

CREATE TEMP TABLE s2_dba_04_results (
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
            (1, 'Soft delete of customer with sales is rejected',
                format('UPDATE customer SET is_deleted = true WHERE custno = %L', 'C0001'),
                'Cannot delete customer row:%'),
            (2, 'Soft delete of product with salesdetail and pricehist is rejected',
                format('UPDATE product SET is_deleted = true WHERE prodcode = %L', 'AK0002'),
                'Cannot delete product row:%'),
            (3, 'Soft delete of product with only pricehist is rejected',
                format('UPDATE product SET is_deleted = true WHERE prodcode = %L', 'PF0002'),
                'Cannot delete product row:%'),
            (4, 'Hard delete of customer is blocked',
                format('DELETE FROM customer WHERE custno = %L', 'C0001'),
                'Hard delete/truncate not allowed on customer%'),
            (5, 'Hard delete of product is blocked',
                format('DELETE FROM product WHERE prodcode = %L', 'AK0002'),
                'Hard delete/truncate not allowed on product%')
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
                INSERT INTO s2_dba_04_results VALUES (t.test_no, t.test_name, 'FAIL', SQLERRM);
            WHEN OTHERS THEN
                IF SQLERRM LIKE t.expected THEN
                    INSERT INTO s2_dba_04_results VALUES (t.test_no, t.test_name, 'PASS', SQLERRM);
                ELSE
                    INSERT INTO s2_dba_04_results VALUES (t.test_no, t.test_name, 'FAIL',
                                                          'unexpected error: ' || SQLERRM);
                END IF;
        END;
    END LOOP;
END;
$$;

SELECT test_no, result, test, detail
FROM s2_dba_04_results
ORDER BY test_no;
