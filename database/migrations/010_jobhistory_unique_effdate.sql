-- =====================================================================
-- S3-DBA-02: Job history validation (no duplicate effective dates)
--
-- The primary key of jobhistory is (empno, jobcode, effdate), so one employee
-- could still get two rows with the same effective date and different job
-- codes. This unique index closes that gap.
--
-- Soft-deleted rows (is_deleted = true) are ignored, so a date can be reused
-- after its row is soft-deleted. Restoring a row is rejected if an active row
-- already uses the same date.
-- =====================================================================

CREATE UNIQUE INDEX jobhistory_empno_effdate_uq
    ON jobhistory (empno, effdate)
    WHERE NOT is_deleted;
