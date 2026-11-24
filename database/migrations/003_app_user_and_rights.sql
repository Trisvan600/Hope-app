-- =====================================================================
-- S1-DBA-03  Migration 003: app_user, role, module, rights, user_permission
--
-- Depends on 002_hope_base_tables.sql (uses its helper functions:
--   audit_user(), audit_stamp(), trg_set_stamp(), trg_audit_log(),
--   trg_block_hard_delete() and the audit_log table).
--
-- Same conventions as 002:
--   * every table has is_deleted (soft delete flag) and stamp
--   * hard DELETE / TRUNCATE are blocked
--   * every change is written to audit_log
--   * <table>_active views show only rows where is_deleted = false
--
-- NOTE: the migration runner already wraps this file in a transaction,
-- so there is no BEGIN / COMMIT here.
-- NOTE: no password column on purpose. audit_log stores full old/new row
-- values, so a password hash here would be copied into the audit history.
-- =====================================================================

-- 1. Tables -------------------------------------------------------------

-- Role catalogue (e.g. ADMIN, STAFF, VIEWER)
CREATE TABLE role (
    role_code    VARCHAR(20)  NOT NULL PRIMARY KEY,
    role_name    VARCHAR(50)  NOT NULL,
    description  VARCHAR(200),
    is_deleted   BOOLEAN      NOT NULL DEFAULT FALSE,
    stamp        VARCHAR(60)
);

-- Modules of the system (what a user can access)
CREATE TABLE module (
    module_code  VARCHAR(20)  NOT NULL PRIMARY KEY,
    module_name  VARCHAR(50)  NOT NULL,
    description  VARCHAR(200),
    is_deleted   BOOLEAN      NOT NULL DEFAULT FALSE,
    stamp        VARCHAR(60)
);

-- Rights catalogue (what a user can do inside a module).
-- Named "rights" because RIGHT is a reserved word in PostgreSQL.
CREATE TABLE rights (
    right_code   VARCHAR(20)  NOT NULL PRIMARY KEY,
    right_name   VARCHAR(50)  NOT NULL,
    description  VARCHAR(200),
    is_deleted   BOOLEAN      NOT NULL DEFAULT FALSE,
    stamp        VARCHAR(60)
);

-- Application users: one role each, plus a blocked flag
CREATE TABLE app_user (
    user_id      BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email        VARCHAR(100) NOT NULL,
    full_name    VARCHAR(100) NOT NULL,
    role_code    VARCHAR(20)  NOT NULL REFERENCES role,
    is_blocked   BOOLEAN      NOT NULL DEFAULT FALSE,
    is_deleted   BOOLEAN      NOT NULL DEFAULT FALSE,
    stamp        VARCHAR(60)
);

-- Email must be unique among active users (a soft-deleted user frees the email)
CREATE UNIQUE INDEX app_user_email_active_uq
    ON app_user (lower(email)) WHERE NOT is_deleted;

-- Which user may do which right in which module
CREATE TABLE user_permission (
    user_id      BIGINT       NOT NULL REFERENCES app_user,
    module_code  VARCHAR(20)  NOT NULL REFERENCES module,
    right_code   VARCHAR(20)  NOT NULL REFERENCES rights,
    is_deleted   BOOLEAN      NOT NULL DEFAULT FALSE,
    stamp        VARCHAR(60),
    PRIMARY KEY (user_id, module_code, right_code)
);

-- 2. Parent check: block soft delete while active children exist ---------
-- (trg_check_children() from 002 only knows the HOPE tables, so these
--  tables get their own version.)
CREATE OR REPLACE FUNCTION trg_check_children_rbac() RETURNS TRIGGER
LANGUAGE plpgsql AS $$
DECLARE
    v_n INT := 0;
BEGIN
    IF NOT (NEW.is_deleted AND NOT OLD.is_deleted) THEN
        RETURN NEW;                                  -- not a soft delete
    END IF;

    CASE TG_TABLE_NAME
        WHEN 'role' THEN
            SELECT count(*) INTO v_n FROM app_user
             WHERE role_code = OLD.role_code AND NOT is_deleted;
        WHEN 'module' THEN
            SELECT count(*) INTO v_n FROM user_permission
             WHERE module_code = OLD.module_code AND NOT is_deleted;
        WHEN 'rights' THEN
            SELECT count(*) INTO v_n FROM user_permission
             WHERE right_code = OLD.right_code AND NOT is_deleted;
        WHEN 'app_user' THEN
            SELECT count(*) INTO v_n FROM user_permission
             WHERE user_id = OLD.user_id AND NOT is_deleted;
        ELSE
            NULL;
    END CASE;

    IF v_n > 0 THEN
        RAISE EXCEPTION 'Cannot delete % row: % active related record(s) still exist.', TG_TABLE_NAME, v_n;
    END IF;
    RETURN NEW;
END;
$$;

-- 3. Attach stamp, audit, hard-delete block and _active views ------------
DO $$
DECLARE
    r      RECORD;
    v_args TEXT;
BEGIN
    FOR r IN
        SELECT * FROM (VALUES
            ('role',            'role_code',                     TRUE),
            ('module',          'module_code',                   TRUE),
            ('rights',          'right_code',                    TRUE),
            ('app_user',        'user_id',                       TRUE),
            ('user_permission', 'user_id,module_code,right_code', FALSE)
        ) AS t(tbl, keycols, has_children)
    LOOP
        SELECT string_agg(quote_literal(k), ',') INTO v_args
          FROM unnest(string_to_array(r.keycols, ',')) AS k;

        IF r.has_children THEN
            EXECUTE format('CREATE TRIGGER %I BEFORE UPDATE ON %I
                            FOR EACH ROW EXECUTE FUNCTION trg_check_children_rbac()',
                           r.tbl || '_bu_check', r.tbl);
        END IF;
        EXECUTE format('CREATE TRIGGER %I BEFORE INSERT OR UPDATE ON %I
                        FOR EACH ROW EXECUTE FUNCTION trg_set_stamp()',
                       r.tbl || '_biu_stamp', r.tbl);
        EXECUTE format('CREATE TRIGGER %I BEFORE DELETE ON %I
                        FOR EACH ROW EXECUTE FUNCTION trg_block_hard_delete()',
                       r.tbl || '_bd_block', r.tbl);
        EXECUTE format('CREATE TRIGGER %I BEFORE TRUNCATE ON %I
                        FOR EACH STATEMENT EXECUTE FUNCTION trg_block_hard_delete()',
                       r.tbl || '_bt_block', r.tbl);
        EXECUTE format('CREATE TRIGGER %I AFTER INSERT OR UPDATE ON %I
                        FOR EACH ROW EXECUTE FUNCTION trg_audit_log(%s)',
                       r.tbl || '_aiu_audit', r.tbl, v_args);

        EXECUTE format('CREATE VIEW %I AS SELECT * FROM %I WHERE NOT is_deleted',
                       r.tbl || '_active', r.tbl);
    END LOOP;
END;
$$;

-- 4. Catalogue seed data --------------------------------------------------
-- Triggers are already attached, so these rows get a stamp and an audit_log
-- entry. Adjust the codes to match the modules your team really builds.
-- No users or passwords are seeded: the DB Admin creates the first admin
-- user and sends a one-time set-password link.

INSERT INTO role (role_code, role_name, description) VALUES
    ('ADMIN',  'Administrator', 'Full access, manages users and permissions'),
    ('STAFF',  'Staff',         'Day-to-day operations'),
    ('VIEWER', 'Viewer',        'Read-only access')
ON CONFLICT (role_code) DO NOTHING;

INSERT INTO module (module_code, module_name, description) VALUES
    ('EMPLOYEES', 'Employees', 'Employee records and job history'),
    ('CUSTOMERS', 'Customers', 'Customer records'),
    ('PRODUCTS',  'Products',  'Products and price history'),
    ('SALES',     'Sales',     'Sales transactions and details'),
    ('PAYMENTS',  'Payments',  'Customer payments'),
    ('REPORTS',   'Reports',   'Reports and exports'),
    ('USERS',     'Users',     'User, role and permission management')
ON CONFLICT (module_code) DO NOTHING;

INSERT INTO rights (right_code, right_name, description) VALUES
    ('VIEW',   'View',   'Open and read records'),
    ('CREATE', 'Create', 'Add new records'),
    ('EDIT',   'Edit',   'Change existing records'),
    ('DELETE', 'Delete', 'Soft-delete records')
ON CONFLICT (right_code) DO NOTHING;

-- =====================================================================
-- Usage examples
--   Block a user    : UPDATE app_user SET is_blocked = true WHERE user_id = 1;
--   Grant a right   : INSERT INTO user_permission (user_id, module_code, right_code)
--                     VALUES (1, 'SALES', 'VIEW')
--                     ON CONFLICT (user_id, module_code, right_code)
--                     DO UPDATE SET is_deleted = false;      -- re-grants a revoked right
--   Revoke a right  : UPDATE user_permission SET is_deleted = true
--                     WHERE user_id = 1 AND module_code = 'SALES' AND right_code = 'VIEW';
--   Active rights   : SELECT * FROM user_permission_active WHERE user_id = 1;
--   History         : SELECT * FROM audit_log WHERE table_name = 'app_user' ORDER BY audit_id;
-- =====================================================================
