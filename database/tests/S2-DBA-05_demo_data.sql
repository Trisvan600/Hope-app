-- S2-DBA-05: Verify demo data for customer, product, price history
-- Demo data comes from 002_hope_base_tables.sql (fictitious data only).
-- Run in the Supabase SQL Editor. Any failed check raises an error.

-- 1. Row counts (active rows only)
SELECT 'customer' AS tbl, count(*) AS active_rows FROM customer_active
UNION ALL SELECT 'product',   count(*) FROM product_active
UNION ALL SELECT 'pricehist', count(*) FROM pricehist_active;

-- 2. Assertions
DO $$
DECLARE
    v_n INT;
BEGIN
    -- customer: at least the 82 demo customers (C0001-C0082)
    SELECT count(*) INTO v_n FROM customer_active WHERE custno ~ '^C[0-9]{4}$';
    IF v_n < 82 THEN
        RAISE EXCEPTION 'FAIL: expected 82 demo customers, found %', v_n;
    END IF;

    -- product: at least the 57 demo products
    SELECT count(*) INTO v_n FROM product_active;
    IF v_n < 57 THEN
        RAISE EXCEPTION 'FAIL: expected 57 demo products, found %', v_n;
    END IF;

    -- every active product has at least one price
    SELECT count(*) INTO v_n
      FROM product_active p
     WHERE NOT EXISTS (SELECT 1 FROM pricehist_active h WHERE h.prodcode = p.prodcode);
    IF v_n > 0 THEN
        RAISE EXCEPTION 'FAIL: % product(s) have no price history', v_n;
    END IF;

    -- price history really has history: some products have 2+ prices
    SELECT count(*) INTO v_n FROM (
        SELECT prodcode FROM pricehist_active GROUP BY prodcode HAVING count(*) > 1
    ) t;
    IF v_n = 0 THEN
        RAISE EXCEPTION 'FAIL: no product has more than one price';
    END IF;

    RAISE NOTICE 'PASS: S2-DBA-05 demo data checks OK';
END;
$$;

-- 3. Sample: price history of products with changes
SELECT prodcode, effdate, unitprice
FROM pricehist_active
WHERE prodcode IN ('MD0001', 'PF0001', 'PC0001')
ORDER BY prodcode, effdate;
