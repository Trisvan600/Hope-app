-- =====================================================================
-- S2-DBA-02  Migration 007: current price as of a given date
--
-- Depends on 002 (product, pricehist and the is_deleted soft-delete column).
--
-- Rule (guide sections 2.5 and 3.4): the price of a product on a date is the
-- active pricehist row with the latest effective date that is on or before
-- that date. Prices are never stored on the sale, so an old sale keeps the
-- price it was sold at even if the price changes later.
-- No price in force on that date -> NULL (shown as "-" on the screens).
--
-- Functions:
--   price_as_of(prodcode, date)    : price of ONE product on a date
--   products_price_as_of(date)     : all active products with their price on a date
--
-- Examples (see the end of the file for expected results).
--
-- NOTE: the functions use the caller's permissions (SECURITY INVOKER, the
-- default), so they follow row level security once it is enabled.
-- NOTE: the migration runner already wraps this file in a transaction.
-- =====================================================================

-- 1. Price of one product on a date ---------------------------------------
CREATE OR REPLACE FUNCTION price_as_of(p_prodcode VARCHAR, p_date DATE)
RETURNS NUMERIC(10,2)
LANGUAGE sql
STABLE
SET search_path = public, pg_temp
AS $$
    SELECT h.unitprice
      FROM pricehist h
     WHERE h.prodcode = p_prodcode
       AND NOT h.is_deleted
       AND h.effdate <= p_date
     ORDER BY h.effdate DESC
     LIMIT 1;
$$;

-- 2. All active products with their price on a date -----------------------
-- price_effdate tells which pricehist row was used.
CREATE OR REPLACE FUNCTION products_price_as_of(p_date DATE)
RETURNS TABLE (
    prodcode       VARCHAR,
    description    VARCHAR,
    unit           VARCHAR,
    unit_price     NUMERIC(10,2),
    price_effdate  DATE
)
LANGUAGE sql
STABLE
SET search_path = public, pg_temp
AS $$
    SELECT p.prodcode::varchar,
           p.description::varchar,
           p.unit::varchar,
           h.unitprice,
           h.effdate
      FROM product p
      LEFT JOIN LATERAL (
            SELECT x.unitprice, x.effdate
              FROM pricehist x
             WHERE x.prodcode = p.prodcode
               AND NOT x.is_deleted
               AND x.effdate <= p_date
             ORDER BY x.effdate DESC
             LIMIT 1
           ) h ON true
     WHERE NOT p.is_deleted
     ORDER BY p.prodcode;
$$;

-- =====================================================================
-- Quick checks (expected results)
--   SELECT price_as_of('PC0001', DATE '2010-06-01');  -- 499.99
--   SELECT price_as_of('PC0001', DATE '2010-07-12');  -- 454.54 (effective date counts)
--   SELECT price_as_of('PC0001', DATE '2010-05-14');  -- NULL   (before the first price)
--   SELECT price_as_of('NB0005', DATE '2011-01-31');  -- NULL
--   SELECT price_as_of('NB0005', DATE '2011-02-01');  -- 1184.72
--
--   SELECT count(*) FILTER (WHERE unit_price IS NOT NULL) AS with_price,
--          count(*) FILTER (WHERE unit_price IS NULL)     AS no_price
--     FROM products_price_as_of(DATE '2010-06-01');      -- 36 and 21
-- =====================================================================
