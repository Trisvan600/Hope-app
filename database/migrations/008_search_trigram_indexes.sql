   -- S2-DBA-06: Trigram indexes so contains-search (ILIKE '%text%') can use an index.
   -- Safe to re-run (IF NOT EXISTS). The existing btree indexes are kept.

   CREATE EXTENSION IF NOT EXISTS pg_trgm;

   CREATE INDEX IF NOT EXISTS idx_customer_custname_trgm
     ON customer USING gin (custname gin_trgm_ops)
     WHERE NOT is_deleted;

   CREATE INDEX IF NOT EXISTS idx_product_description_trgm
     ON product USING gin (description gin_trgm_ops)
     WHERE NOT is_deleted;
