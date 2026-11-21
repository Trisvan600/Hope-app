-- S3-DBA-03: Link app_user.empno to employee
-- empno is nullable so accounts that are not employees (e.g. admin) still work.

ALTER TABLE app_user
    ADD COLUMN empno VARCHAR(5);

ALTER TABLE app_user
    ADD CONSTRAINT app_user_empno_fk
    FOREIGN KEY (empno) REFERENCES employee (empno);
