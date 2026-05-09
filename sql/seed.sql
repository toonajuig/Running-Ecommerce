-- Seed data for RunStore
-- Run AFTER init.sql: npm run db:seed

-- ─── Categories ───────────────────────────────────────────────────────────────

INSERT INTO categories (slug, name) VALUES
  ('running-shoes', 'รองเท้าวิ่ง'),
  ('accessories',   'อุปกรณ์เสริมการวิ่ง');

-- ─── Brands ───────────────────────────────────────────────────────────────────

INSERT INTO brands (slug, name) VALUES
  ('nike',     'Nike'),
  ('adidas',   'Adidas'),
  ('asics',    'ASICS'),
  ('hoka',     'Hoka'),
  ('saucony',  'Saucony');

-- ─── Products + Variants ──────────────────────────────────────────────────────
-- ใช้ CTE เพื่อดึง id ของ category/brand โดยไม่ต้อง hardcode ตัวเลข
-- (ถ้า hardcode แล้ว init.sql เปลี่ยน order → id เลื่อน → seed พัง)

WITH
  cat_shoes AS (SELECT id FROM categories WHERE slug = 'running-shoes'),
  cat_acc   AS (SELECT id FROM categories WHERE slug = 'accessories'),
  b_nike    AS (SELECT id FROM brands WHERE slug = 'nike'),
  b_adidas  AS (SELECT id FROM brands WHERE slug = 'adidas'),
  b_asics   AS (SELECT id FROM brands WHERE slug = 'asics'),
  b_hoka    AS (SELECT id FROM brands WHERE slug = 'hoka'),
  b_saucony AS (SELECT id FROM brands WHERE slug = 'saucony'),

  inserted_products AS (
    INSERT INTO products
      (category_id, brand_id, name, description, price, gender, shoe_type, weight_grams, drop_mm)
    VALUES
      -- รองเท้าวิ่ง (10 รุ่น)
      ((SELECT id FROM cat_shoes), (SELECT id FROM b_nike),
       'Nike Pegasus 41', 'รองเท้าวิ่งเดลี่ทนทาน เหมาะสำหรับวิ่งถนนทุกระยะ', 4590,
       'unisex', 'road', 283, 10),

      ((SELECT id FROM cat_shoes), (SELECT id FROM b_nike),
       'Nike Vomero 18', 'คุชชั่นสูง นิ่มมาก เหมาะสำหรับวิ่งระยะไกล', 5990,
       'unisex', 'road', 299, 8),

      ((SELECT id FROM cat_shoes), (SELECT id FROM b_adidas),
       'Adidas Ultraboost 5', 'Boost foam คลาสสิก ตอบสนองดี', 5200,
       'unisex', 'road', 310, 10),

      ((SELECT id FROM cat_shoes), (SELECT id FROM b_adidas),
       'Adidas Adizero SL2', 'เบาและรวดเร็ว เหมาะสำหรับ tempo run', 3990,
       'unisex', 'road', 246, 8),

      ((SELECT id FROM cat_shoes), (SELECT id FROM b_asics),
       'ASICS Gel-Kayano 31', 'stability shoe สำหรับนักวิ่ง overpronation', 5800,
       'unisex', 'road', 310, 13),

      ((SELECT id FROM cat_shoes), (SELECT id FROM b_hoka),
       'Hoka Clifton 9', 'คุชชั่นสูงสุด น้ำหนักเบา เหมาะสำหรับวิ่ง easy day', 5400,
       'unisex', 'road', 252, 5),

      ((SELECT id FROM cat_shoes), (SELECT id FROM b_hoka),
       'Hoka Speedgoat 6', 'รองเท้า trail ที่แกร่งที่สุดของ Hoka', 5900,
       'unisex', 'trail', 298, 4),

      ((SELECT id FROM cat_shoes), (SELECT id FROM b_saucony),
       'Saucony Ride 17', 'balanced cushion เหมาะสำหรับวิ่งทุกวัน', 4800,
       'unisex', 'road', 279, 8),

      ((SELECT id FROM cat_shoes), (SELECT id FROM b_saucony),
       'Saucony Endorphin Speed 4', 'carbon-fiber plate สำหรับ race day', 6200,
       'unisex', 'road', 222, 8),

      ((SELECT id FROM cat_shoes), (SELECT id FROM b_asics),
       'ASICS Trabuco Max 3', 'trail shoe คุชชั่นสูง เหมาะสำหรับ ultra marathon', 5600,
       'unisex', 'trail', 320, 6),

      -- อุปกรณ์เสริม (6 รายการ) ไม่มี brand_id, gender, shoe_type, weight_grams, drop_mm
      ((SELECT id FROM cat_acc), NULL,
       'ถุงเท้าวิ่ง Compression', 'ถุงเท้าแบบรัด ลดการเมื่อย ระบายอากาศดี', 299,
       NULL, NULL, NULL, NULL),

      ((SELECT id FROM cat_acc), NULL,
       'ขวดน้ำ Hydration Soft Flask 500ml', 'ขวดน้ำซิลิโคน นิ่ม พับได้ เหมาะสำหรับ trail', 590,
       NULL, NULL, NULL, NULL),

      ((SELECT id FROM cat_acc), NULL,
       'เข็มขัดคาดเอว Running Belt', 'ใส่โทรศัพท์และของจิปาถะ ไม่โยกเยก', 450,
       NULL, NULL, NULL, NULL),

      ((SELECT id FROM cat_acc), NULL,
       'นาฬิกา GPS Garmin Forerunner 265', 'GPS แม่นยำ, Heart Rate, วัด VO2max', 12900,
       NULL, NULL, NULL, NULL),

      ((SELECT id FROM cat_acc), NULL,
       'สายรัดแขน Phone Armband', 'ใส่โทรศัพท์ขณะวิ่ง กันเหงื่อ', 290,
       NULL, NULL, NULL, NULL),

      ((SELECT id FROM cat_acc), NULL,
       'โฟมนวดกล้ามเนื้อ Foam Roller', 'คลายกล้ามเนื้อหลังวิ่ง ยาว 33 cm', 650,
       NULL, NULL, NULL, NULL)

    RETURNING id, name
  )

-- ─── Variants ─────────────────────────────────────────────────────────────────
-- shoes → 3 ไซส์ (40, 42, 44)   accessories → one-size
-- sku format: {product_id}-{size}  (ต้อง unique)

INSERT INTO product_variants (product_id, size, sku, stock, price_override)
SELECT
  p.id,
  v.size,
  p.id || '-' || v.size  AS sku,   -- เช่น "1-42", "1-44"
  v.stock,
  NULL::NUMERIC                     -- ใช้ราคาจาก products.price ทั้งหมด
FROM inserted_products p
CROSS JOIN LATERAL (
  VALUES
    ('40', 10),
    ('42', 15),
    ('44', 8)
) AS v(size, stock)
WHERE p.name IN (
  'Nike Pegasus 41', 'Nike Vomero 18',
  'Adidas Ultraboost 5', 'Adidas Adizero SL2',
  'ASICS Gel-Kayano 31', 'Hoka Clifton 9', 'Hoka Speedgoat 6',
  'Saucony Ride 17', 'Saucony Endorphin Speed 4', 'ASICS Trabuco Max 3'
)

UNION ALL

SELECT
  p.id,
  'one-size',
  p.id || '-one-size' AS sku,
  20,
  NULL::NUMERIC
FROM inserted_products p
WHERE p.name IN (
  'ถุงเท้าวิ่ง Compression', 'ขวดน้ำ Hydration Soft Flask 500ml',
  'เข็มขัดคาดเอว Running Belt', 'นาฬิกา GPS Garmin Forerunner 265',
  'สายรัดแขน Phone Armband', 'โฟมนวดกล้ามเนื้อ Foam Roller'
);
