-- Halal Finder schema (SQLite). Kept to portable SQL so it can move to Postgres later.

CREATE TABLE IF NOT EXISTS certifiers (
  id               TEXT PRIMARY KEY,
  name             TEXT NOT NULL,
  short_name       TEXT NOT NULL,
  country          TEXT NOT NULL,
  website          TEXT,
  description      TEXT NOT NULL,
  slaughter_policy TEXT NOT NULL DEFAULT 'varies' -- hand_only | stunning_permitted | varies
);

CREATE TABLE IF NOT EXISTS restaurants (
  id               TEXT PRIMARY KEY,
  name             TEXT NOT NULL,
  description      TEXT NOT NULL,
  category         TEXT NOT NULL,                -- restaurant | takeaway | cafe | dessert | butcher | grocery
  cuisine          TEXT NOT NULL,
  address          TEXT NOT NULL,
  city             TEXT NOT NULL,
  postcode         TEXT,
  country          TEXT NOT NULL DEFAULT 'United Kingdom',
  timezone         TEXT NOT NULL DEFAULT 'Europe/London',
  lat              REAL NOT NULL,
  lng              REAL NOT NULL,
  phone            TEXT,
  price_level      INTEGER NOT NULL DEFAULT 2,   -- 1..4
  rating           REAL NOT NULL DEFAULT 0,
  review_count     INTEGER NOT NULL DEFAULT 0,
  halal_status     TEXT NOT NULL,                -- fully_halal | halal_options
  alcohol_free     INTEGER NOT NULL DEFAULT 1,
  hand_slaughtered INTEGER NOT NULL DEFAULT 0,
  features         TEXT NOT NULL DEFAULT '[]',   -- JSON array of feature keys
  hours            TEXT NOT NULL DEFAULT '{}',   -- JSON { mon: [["12:00","22:00"]], ... }
  image_url        TEXT,
  certifier_id     TEXT REFERENCES certifiers(id),
  cert_number      TEXT,
  cert_expires     TEXT,                         -- ISO date
  last_verified    TEXT,                         -- ISO date
  created_at       TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_restaurants_lat_lng ON restaurants(lat, lng);
CREATE INDEX IF NOT EXISTS idx_restaurants_city ON restaurants(city);
CREATE INDEX IF NOT EXISTS idx_restaurants_certifier ON restaurants(certifier_id);

CREATE TABLE IF NOT EXISTS products (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  brand         TEXT NOT NULL,
  category      TEXT NOT NULL,
  description   TEXT NOT NULL,
  size          TEXT,
  barcode       TEXT UNIQUE,
  image_url     TEXT,
  dietary       TEXT NOT NULL DEFAULT '[]',      -- JSON array: alcohol_free, gelatine_free, vegetarian, vegan, hand_slaughtered
  certifier_id  TEXT REFERENCES certifiers(id),
  cert_number   TEXT,
  cert_expires  TEXT,
  last_verified TEXT
);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);

CREATE TABLE IF NOT EXISTS product_stockists (
  product_id    TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  restaurant_id TEXT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, restaurant_id)
);

CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password_hash TEXT NOT NULL,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS favorites (
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  item_type  TEXT NOT NULL CHECK (item_type IN ('restaurant', 'product')),
  item_id    TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (user_id, item_type, item_id)
);

CREATE TABLE IF NOT EXISTS reports (
  id         TEXT PRIMARY KEY,
  user_id    TEXT REFERENCES users(id) ON DELETE SET NULL,
  item_type  TEXT NOT NULL CHECK (item_type IN ('restaurant', 'product')),
  item_id    TEXT NOT NULL,
  reason     TEXT NOT NULL,
  details    TEXT,
  status     TEXT NOT NULL DEFAULT 'open',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
