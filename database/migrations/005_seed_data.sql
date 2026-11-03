
ALTER TABLE rights ADD COLUMN IF NOT EXISTS module_code VARCHAR(20) REFERENCES module;

CREATE OR REPLACE VIEW rights_active AS SELECT * FROM rights WHERE NOT is_deleted;

UPDATE role   SET is_deleted = true
 WHERE role_code   IN ('STAFF', 'VIEWER')                                   AND NOT is_deleted;
UPDATE module SET is_deleted = true
 WHERE module_code IN ('EMPLOYEES', 'CUSTOMERS', 'PRODUCTS', 'PAYMENTS', 'USERS') AND NOT is_deleted;
UPDATE rights SET is_deleted = true
 WHERE right_code  IN ('VIEW', 'CREATE', 'EDIT', 'DELETE')                  AND NOT is_deleted;

INSERT INTO role (role_code, role_name, description) VALUES
    ('SUPERADMIN', 'Superadmin', 'System owner: everything, including assigning any role'),
    ('ADMIN',      'Admin',      'Manager: manages most modules and user rights, cannot see or change Superadmin accounts'),
    ('USER',       'User',       'Staff: only the modules and actions an Admin has granted')
ON CONFLICT (role_code) DO UPDATE
    SET role_name = EXCLUDED.role_name,
        description = EXCLUDED.description,
        is_deleted = false;

INSERT INTO module (module_code, module_name, description) VALUES
    ('CUSTOMER',        'Customer',        'Customer records'),
    ('PRODUCT',         'Product',         'Products and their price history'),
    ('HUMAN_RESOURCES', 'Human Resources', 'Employees, jobs, departments and job history'),
    ('SALES',           'Sales',           'Sales and sale details'),
    ('REPORTS',         'Reports',         'Read-only reports')
ON CONFLICT (module_code) DO UPDATE
    SET module_name = EXCLUDED.module_name,
        description = EXCLUDED.description,
        is_deleted = false;

INSERT INTO rights (right_code, right_name, description, module_code) VALUES
    
    ('CUSTOMER_ADD',       'Add Customer',    'Create a customer',          'CUSTOMER'),
    ('CUSTOMER_EDIT',      'Edit Customer',   'Change a customer',          'CUSTOMER'),
    ('CUSTOMER_DELETE',    'Delete Customer', 'Soft-delete a customer',     'CUSTOMER'),
    
    ('PRODUCT_ADD',        'Add Product',     'Create a product',           'PRODUCT'),
    ('PRODUCT_EDIT',       'Edit Product',    'Change a product',           'PRODUCT'),
    ('PRODUCT_DELETE',     'Delete Product',  'Soft-delete a product',      'PRODUCT'),
    ('PRICE_ADD',          'Add Price',       'Add a price to a product',   'PRODUCT'),
    ('PRICE_EDIT',         'Edit Price',      'Change a product price',     'PRODUCT'),
    ('PRICE_DELETE',       'Delete Price',    'Soft-delete a product price','PRODUCT'),
    
    ('JOB_ADD',            'Add Job',               'Create a job',                'HUMAN_RESOURCES'),
    ('JOB_EDIT',           'Edit Job',              'Change a job',                'HUMAN_RESOURCES'),
    ('JOB_DELETE',         'Delete Job',            'Soft-delete a job',           'HUMAN_RESOURCES'),
    ('DEPARTMENT_ADD',     'Add Department',        'Create a department',         'HUMAN_RESOURCES'),
    ('DEPARTMENT_EDIT',    'Edit Department',       'Change a department',         'HUMAN_RESOURCES'),
    ('DEPARTMENT_DELETE',  'Delete Department',     'Soft-delete a department',    'HUMAN_RESOURCES'),
    ('EMPLOYEE_ADD',       'Add Employee',          'Create an employee',          'HUMAN_RESOURCES'),
    ('EMPLOYEE_EDIT',      'Edit Employee',         'Change an employee',          'HUMAN_RESOURCES'),
    ('EMPLOYEE_DELETE',    'Delete Employee',       'Soft-delete an employee',     'HUMAN_RESOURCES'),
    ('JOBHISTORY_VIEW',    'View Job History',      'See an employee job history', 'HUMAN_RESOURCES'),
    ('JOBHISTORY_ADD',     'Add Job History',       'Add a job history row',       'HUMAN_RESOURCES'),
    ('JOBHISTORY_EDIT',    'Edit Job History',      'Change a job history row',    'HUMAN_RESOURCES'),
    ('JOBHISTORY_DELETE',  'Delete Job History',    'Soft-delete a job history row','HUMAN_RESOURCES'),
    
    ('SALE_ADD',           'Add Sale',              'Create a sale',               'SALES'),
    ('SALE_EDIT',          'Edit Sale',             'Change a sale',               'SALES'),
    ('SALE_DELETE',        'Delete Sale',           'Soft-delete a sale',          'SALES'),
    ('SALEDETAIL_VIEW',    'View Sale Details',     'See the lines of a sale',     'SALES'),
    ('SALEDETAIL_ADD',     'Add Sale Detail',       'Add a line to a sale',        'SALES'),
    ('SALEDETAIL_EDIT',    'Edit Sale Detail',      'Change a sale line',          'SALES'),
    ('SALEDETAIL_DELETE',  'Delete Sale Detail',    'Soft-delete a sale line',     'SALES'),
    
    ('RPT_TOP_CUSTOMERS',  'Top Customers',         'Open the Top Customers report',        'REPORTS'),
    ('RPT_PRODUCT_LIST',   'Product Master List',   'Open the Product Master List report',  'REPORTS'),
    ('RPT_TOP_PRODUCTS',   'Top Products',          'Open the Top Products report',         'REPORTS'),
    ('RPT_ACTIVE_EMPLOYEES','Active Employees',     'Open the Active Employees report',     'REPORTS'),
    ('RPT_ALL_EMPLOYEES',  'All Employees',         'Open the All Employees report',        'REPORTS'),
    ('RPT_EMP_JOB_HISTORY','Employee Job History',  'Open the Employee Job History report', 'REPORTS'),
    ('RPT_TOP_SALES',      'Top Sales',             'Open the Top Sales report',            'REPORTS')
ON CONFLICT (right_code) DO UPDATE
    SET right_name = EXCLUDED.right_name,
        description = EXCLUDED.description,
        module_code = EXCLUDED.module_code,
        is_deleted = false;

INSERT INTO app_user (email, full_name, role_code) VALUES
    ('migsjavierbiacolo21@gmail.com',          'Carlos Miguel Biacolo',    'SUPERADMIN'),
    ('tristanivan.delrosario@neu.edu.ph',      'Tristan Ivan Del Rosario', 'SUPERADMIN'),
    ('ariahlin.valencia@neu.edu.ph',           'Ariah Lin Valencia',       'SUPERADMIN'),
    ('princelawrence.alarcon@neu.edu.ph',      'Prince Lawrence Alarcon',  'SUPERADMIN'),
    ('jairah.gregorio@neu.edu.ph',             'Jairah Gregorio',          'SUPERADMIN')
ON CONFLICT (lower(email)) WHERE NOT is_deleted DO NOTHING;

