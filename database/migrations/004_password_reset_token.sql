-- =====================================================================
-- S1-DBA-04  Migration 004: password_reset_token
--
-- Depends on 002 (audit helpers) and 003 (app_user).
--
-- Used for password reset links and the first "set password" link
-- (S1-DBA-05: no passwords in the repo).
--
-- How the app should use it:
--   1. Generate a long random token (e.g. 32 random bytes) and email the link.
--   2. Store ONLY its SHA-256 hash (hex) in token_hash. Never store the raw token.
--   3. When the link is opened: hash the token, look it up, then check
--        is_used = false AND expires_at > now() AND is_deleted = false
--   4. After a successful password change, set is_used = true AND used_at = now().
--
-- Same conventions as 002 / 003: is_deleted, stamp, audit_log, hard DELETE
-- blocked, and a password_reset_token_active view.
--
-- NOTE: the audit trigger for this table hides token_hash, so token hashes
-- are never copied into audit_log.
-- NOTE: the migration runner already wraps this file in a transaction.
-- =====================================================================

-- 1. Table ---------------------------------------------------------------
CREATE TABLE password_reset_token (
    token_id     BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id      BIGINT       NOT NULL REFERENCES app_user,
    token_hash   VARCHAR(128) NOT NULL,                 -- hash only, never the raw token
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),
    expires_at   TIMESTAMPTZ  NOT NULL,
    is_used      BOOLEAN      NOT NULL DEFAULT FALSE,
    used_at      TIMESTAMPTZ,
    is_deleted   BOOLEAN      NOT NULL DEFAULT FALSE,
    stamp        VARCHAR(60),
    CONSTRAINT prt_expiry_ck   CHECK (expires_at > created_at),
    CONSTRAINT prt_used_ck     CHECK ((is_used AND used_at IS NOT NULL)
                                   OR (NOT is_used AND used_at IS NULL))
);

CREATE UNIQUE INDEX password_reset_token_hash_uq ON password_reset_token (token_hash);
CREATE INDEX password_reset_token_user_ix        ON password_reset_token (user_id);

-- 2. Audit trigger that leaves token_hash out of audit_log ---------------
-- (trg_audit_log() from 002 copies the whole row, so this table gets its own.)
CREATE OR REPLACE FUNCTION trg_audit_log_password_reset_token() RETURNS TRIGGER
LANGUAGE plpgsql AS $$
DECLARE
    v_action TEXT;
    v_new    JSONB := to_jsonb(NEW) - 'token_hash';
    v_old    JSONB;
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_log (table_name, action, record_key, old_values, new_values, action_by)
        VALUES (TG_TABLE_NAME, 'ADD', NEW.token_id::text, NULL, v_new, audit_user());
    ELSE
        IF (to_jsonb(OLD) - 'stamp') = (to_jsonb(NEW) - 'stamp') THEN
            RETURN NULL;                             -- nothing changed, no log
        END IF;
        v_old := to_jsonb(OLD) - 'token_hash';
        v_action := CASE
                      WHEN NOT OLD.is_deleted AND NEW.is_deleted THEN 'DELETE'
                      WHEN OLD.is_deleted AND NOT NEW.is_deleted THEN 'RESTORE'
                      ELSE 'EDIT'
                    END;
        INSERT INTO audit_log (table_name, action, record_key, old_values, new_values, action_by)
        VALUES (TG_TABLE_NAME, v_action, NEW.token_id::text, v_old, v_new, audit_user());
    END IF;
    RETURN NULL;
END;
$$;

-- 3. Attach stamp, audit, hard-delete block and the _active view ---------
CREATE TRIGGER password_reset_token_biu_stamp
    BEFORE INSERT OR UPDATE ON password_reset_token
    FOR EACH ROW EXECUTE FUNCTION trg_set_stamp();

CREATE TRIGGER password_reset_token_bd_block
    BEFORE DELETE ON password_reset_token
    FOR EACH ROW EXECUTE FUNCTION trg_block_hard_delete();

CREATE TRIGGER password_reset_token_bt_block
    BEFORE TRUNCATE ON password_reset_token
    FOR EACH STATEMENT EXECUTE FUNCTION trg_block_hard_delete();

CREATE TRIGGER password_reset_token_aiu_audit
    AFTER INSERT OR UPDATE ON password_reset_token
    FOR EACH ROW EXECUTE FUNCTION trg_audit_log_password_reset_token();

CREATE VIEW password_reset_token_active AS
    SELECT * FROM password_reset_token WHERE NOT is_deleted;

-- =====================================================================
-- Usage examples
--   Valid token lookup :
--     SELECT * FROM password_reset_token_active
--      WHERE token_hash = '<sha256 hex of the token>'
--        AND NOT is_used AND expires_at > now();
--   Mark as used       :
--     UPDATE password_reset_token SET is_used = true, used_at = now()
--      WHERE token_id = 1;
--   Remove a token     :
--     UPDATE password_reset_token SET is_deleted = true WHERE token_id = 1;
-- =====================================================================
