-- =====================================================================
-- S2-DBA-01  Migration 006: Customer and Product active views, indexes
--
-- Depends on 002 (customer, product, pricehist, sales, salesdetail and the
-- is_deleted soft-delete column).
--
-- Views (for the screens that must NOT show Status / Stamp, e.g. the User role):
--   v_customer_active : active customers, business columns only
--   v_product_active  : active products plus current_price
--                       (latest active price whose effective date is not in the future,
--                        guide section 3.4; NULL when there is no price, shown as "-")
--
-- The Admin / Superadmin screens keep using customer_active / product_active
-- from 002, which still show is_deleted and stamp.
--
-- Columns are listed explicitly (no SELECT *), so a column added to a table
-- later does not silently change what a view returns.
--
-- Indexes: speed up the Customer / Product lists, the current-price lookup,
-- and the "does this row still have active children?" checks done by
-- trg_check_children() when a customer or product is soft-deleted.
--
-- NOTE: the migration runner already wraps this file in a transaction.
-- =====================================================================

-- 1. Customer: active rows, business columns only -------------------------
CREATE OR REPLACE VIEW v_customer_active
WITH (security_invoker = true) AS
SELECT c.custno,
       c.custname,
       c.address,
       c.payterm
FROM   customer c
WHERE  NOT c.is_deleted;

-- 2. Product: active rows with the current price ---------------------------
CREATE OR REPLACE VIEW v_product_active
WITH (security_invoker = true) AS
SELECT p.prodcode,
       p.description,
       p.unit,
       (SELECT h.unitprice
          FROM pricehist h
         WHERE h.prodcode = p.prodcode
           AND NOT h.is_deleted
           AND h.effdate <= (now() AT TIME ZONE 'Asia/Manila')::date
         ORDER BY h.effdate DESC
         LIMIT 1) AS current_price
FROM   product p
WHERE  NOT p.is_deleted;

-- 3. Indexes --------------------------------------------------------------
-- Lists, search and sorting of active rows
CREATE INDEX IF NOT EXISTS idx_customer_custname_active
    ON customer (custname) WHERE NOT is_deleted;

CREATE INDEX IF NOT EXISTS idx_product_description_active
    ON product (description) WHERE NOT is_deleted;

-- Current price lookup (the primary key of pricehist starts with effdate,
-- so it cannot be used to find the prices of one product)
CREATE INDEX IF NOT EXISTS idx_pricehist_prodcode_effdate_active
    ON pricehist (prodcode, effdate DESC) WHERE NOT is_deleted;

-- Foreign keys are not indexed automatically in PostgreSQL.
-- Used by the children checks when a customer / product is soft-deleted.
CREATE INDEX IF NOT EXISTS idx_sales_custno
    ON sales (custno);

CREATE INDEX IF NOT EXISTS idx_salesdetail_prodcode
    ON salesdetail (prodcode);

-- =====================================================================
-- Quick checks
--   SELECT * FROM v_customer_active LIMIT 5;      -- 4 columns, no status / stamp
--   SELECT * FROM v_product_active ORDER BY prodcode LIMIT 10;
--   SELECT prodcode, current_price FROM v_product_active
--    WHERE prodcode IN ('PC0001', 'NB0005');
--      -- PC0001 = 454.54 (price of 2010-07-12), NB0005 = 1184.72
--   SELECT indexname FROM pg_indexes
--    WHERE schemaname = 'public' AND indexname LIKE 'idx\_%' ORDER BY 1;
-- =====================================================================
