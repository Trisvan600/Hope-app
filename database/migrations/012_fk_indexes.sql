-- =====================================================================
-- S3-DBA-06 (part 1): Indexes on foreign key columns that have none
--
-- PostgreSQL does not create an index on a foreign key column by itself.
-- Without one, joins on that column and lookups of child rows (for example
-- the child-record checks in trg_check_children()) scan the whole table.
--
-- Found by comparing the foreign keys with the existing indexes (pg_indexes).
-- The other foreign keys already have an index, so nothing is added for them.
--
-- user_permission has the primary key (user_id, module_code, right_code), so
-- user_id is already covered, but module_code and right_code are not: neither
-- is the first column of any index.
-- =====================================================================

-- payment.transno -> sales(transno)
CREATE INDEX IF NOT EXISTS idx_payment_transno
    ON payment (transno);

-- rights.module_code -> module(module_code)
CREATE INDEX IF NOT EXISTS idx_rights_module_code
    ON rights (module_code);

-- app_user.empno -> employee(empno)
CREATE INDEX IF NOT EXISTS idx_app_user_empno
    ON app_user (empno);

-- app_user.role_code -> role(role_code)
CREATE INDEX IF NOT EXISTS idx_app_user_role_code
    ON app_user (role_code);

-- user_permission.module_code -> module(module_code)
CREATE INDEX IF NOT EXISTS idx_user_permission_module_code
    ON user_permission (module_code);

-- user_permission.right_code -> rights(right_code)
CREATE INDEX IF NOT EXISTS idx_user_permission_right_code
    ON user_permission (right_code);

-- ---------------------------------------------------------------------
-- Check after the migration (Supabase SQL Editor):
--   SELECT tablename, indexname
--   FROM pg_indexes
--   WHERE schemaname = 'public'
--     AND indexname IN ('idx_payment_transno', 'idx_rights_module_code',
--                       'idx_app_user_empno', 'idx_app_user_role_code',
--                       'idx_user_permission_module_code',
--                       'idx_user_permission_right_code')
--   ORDER BY tablename, indexname;                       -- 6 rows
-- ---------------------------------------------------------------------
