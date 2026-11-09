-- =====================================================================
-- S2-DBA-03  Migration 005: validation constraints (unit, payterm)
--
-- Depends on 002 (product, customer tables).
--
-- Allowed values:
--   product.unit      : 'pc', 'ea'
--   customer.payterm  : 'COD', '30D', '45D'
--
-- Idempotent: safe to run even if unit_ck / pay_ck already exist.
-- Views (product_active, customer_active, etc.) follow the base tables,
-- so they need no constraint of their own.
-- =====================================================================

ALTER TABLE product DROP CONSTRAINT IF EXISTS unit_ck;
ALTER TABLE product
    ADD CONSTRAINT unit_ck CHECK (unit IN ('pc', 'ea'));

ALTER TABLE customer DROP CONSTRAINT IF EXISTS pay_ck;
ALTER TABLE customer
    ADD CONSTRAINT pay_ck CHECK (payterm IN ('COD', '30D', '45D'));
