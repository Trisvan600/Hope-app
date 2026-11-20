-- S3-DBA-04: Child-record delete checks
-- Block soft delete (is_deleted = true) of a department or job
-- while active employees (is_deleted = false) are still assigned.

-- ============ DEPARTMENTS ============
CREATE OR REPLACE FUNCTION public.prevent_soft_delete_department()
RETURNS trigger AS $$
BEGIN
  IF NEW.is_deleted = true AND OLD.is_deleted = false THEN
    IF EXISTS (
      SELECT 1 FROM public.employees
      WHERE department_id = OLD.id AND is_deleted = false
    ) THEN
      RAISE EXCEPTION 'Cannot delete department: active employees still assigned'
        USING ERRCODE = '23503';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_prevent_soft_delete_department ON public.departments;
CREATE TRIGGER trg_prevent_soft_delete_department
BEFORE UPDATE ON public.departments
FOR EACH ROW EXECUTE FUNCTION public.prevent_soft_delete_department();

-- ============ JOBS ============
CREATE OR REPLACE FUNCTION public.prevent_soft_delete_job()
RETURNS trigger AS $$
BEGIN
  IF NEW.is_deleted = true AND OLD.is_deleted = false THEN
    IF EXISTS (
      SELECT 1 FROM public.employees
      WHERE job_id = OLD.id AND is_deleted = false
    ) THEN
      RAISE EXCEPTION 'Cannot delete job: active employees still assigned'
        USING ERRCODE = '23503';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_prevent_soft_delete_job ON public.jobs;
CREATE TRIGGER trg_prevent_soft_delete_job
BEFORE UPDATE ON public.jobs
FOR EACH ROW EXECUTE FUNCTION public.prevent_soft_delete_job();

-- ============ ROLLBACK (run manually only if this change must be reverted) ============
-- DROP TRIGGER IF EXISTS trg_prevent_soft_delete_department ON public.departments;
-- DROP FUNCTION IF EXISTS public.prevent_soft_delete_department();
-- DROP TRIGGER IF EXISTS trg_prevent_soft_delete_job ON public.jobs;
-- DROP FUNCTION IF EXISTS public.prevent_soft_delete_job();
