-- Re-runnable schema. WARNING: drops existing tables and data.
DROP TABLE IF EXISTS order_items     CASCADE;
DROP TABLE IF EXISTS orders          CASCADE;
DROP TABLE IF EXISTS product_variants CASCADE;
DROP TABLE IF EXISTS products        CASCADE;
DROP TABLE IF EXISTS brands          CASCADE;
DROP TABLE IF EXISTS categories      CASCADE;
DROP TABLE IF EXISTS users           CASCADE;

-- ─── Lookup tables ───────────────────────────────────────────────────────────

CREATE TABLE categories (
  id         SERIAL      PRIMARY KEY,
  slug       VARCHAR(80) UNIQUE NOT NULL,   -- e.g. "running-shoes"
  name       VARCHAR(120) NOT NULL           -- e.g. "รองเท้าวิ่ง"
);

CREATE TABLE brands (
  id         SERIAL      PRIMARY KEY,
  slug       VARCHAR(80) UNIQUE NOT NULL,   -- e.g. "hoka"
  name       VARCHAR(120) NOT NULL,          -- e.g. "Hoka"
  logo_url   TEXT
);

-- ─── Core product ─────────────────────────────────────────────────────────────

CREATE TABLE products (
  id           SERIAL        PRIMARY KEY,
  category_id  INTEGER       NOT NULL REFERENCES categories(id),
  brand_id     INTEGER       REFERENCES brands(id),          -- nullable: accessories อาจไม่มี brand
  name         VARCHAR(200)  NOT NULL,
  description  TEXT,
  price        NUMERIC(10,2) NOT NULL CHECK (price >= 0),    -- base price (variant อาจ override ได้)
  image_url    TEXT,
  -- รองเท้าเท่านั้นที่มีค่าเหล่านี้ -- accessories จะ NULL
  gender       VARCHAR(10)   CHECK (gender IN ('men', 'women', 'unisex')),
  shoe_type    VARCHAR(10)   CHECK (shoe_type IN ('road', 'trail', 'track')),
  weight_grams INTEGER       CHECK (weight_grams > 0),
  drop_mm      INTEGER       CHECK (drop_mm >= 0),
  created_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ─── Size variants ────────────────────────────────────────────────────────────
-- ทุก product มีอย่างน้อย 1 variant
-- รองเท้า: หลาย variant (ไซส์ต่างกัน)
-- accessories: 1 variant (size = 'one-size')

CREATE TABLE product_variants (
  id             SERIAL        PRIMARY KEY,
  product_id     INTEGER       NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size           VARCHAR(20)   NOT NULL,           -- "42", "43", "one-size", "S", "M", ...
  sku            VARCHAR(80)   UNIQUE NOT NULL,     -- Stock Keeping Unit, รหัสเฉพาะของ variant นั้น
  stock          INTEGER       NOT NULL DEFAULT 0 CHECK (stock >= 0),
  price_override NUMERIC(10,2) CHECK (price_override >= 0)  -- NULL = ใช้ราคาจาก products.price
);

-- ─── Orders ───────────────────────────────────────────────────────────────────

CREATE TABLE users (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(120) NOT NULL,
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role          VARCHAR(20)  NOT NULL DEFAULT 'customer'
                CHECK (role IN ('customer', 'admin')),
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE orders (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  total      NUMERIC(10,2) NOT NULL CHECK (total >= 0),
  status     VARCHAR(20)   NOT NULL DEFAULT 'pending'
             CHECK (status IN ('pending', 'paid', 'shipped', 'delivered', 'cancelled')),
  created_at TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE TABLE order_items (
  id         SERIAL        PRIMARY KEY,
  order_id   INTEGER       NOT NULL REFERENCES orders(id)          ON DELETE CASCADE,
  variant_id INTEGER       NOT NULL REFERENCES product_variants(id) ON DELETE RESTRICT,
  quantity   INTEGER       NOT NULL CHECK (quantity > 0),
  price      NUMERIC(10,2) NOT NULL CHECK (price >= 0)  -- snapshot ราคา ณ เวลาที่ซื้อ
);

-- ─── Indexes ──────────────────────────────────────────────────────────────────

CREATE INDEX idx_products_category   ON products(category_id);
CREATE INDEX idx_products_brand      ON products(brand_id);
CREATE INDEX idx_variants_product    ON product_variants(product_id);
CREATE INDEX idx_orders_user_id      ON orders(user_id);
CREATE INDEX idx_order_items_order   ON order_items(order_id);
CREATE INDEX idx_order_items_variant ON order_items(variant_id);
