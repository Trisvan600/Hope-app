
CREATE TABLE IF NOT EXISTS app_info (
  id SERIAL PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO app_info (key, value)
VALUES ('schema_version', '1')
ON CONFLICT (key) DO NOTHING;
