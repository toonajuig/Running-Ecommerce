const { query } = require('../config/db');

// ORDER BY ที่อนุญาต — ค่า key มาจาก user แต่ value ถูก whitelist ไว้ → ปลอดภัยจาก SQL injection
const ORDER_MAP = {
  price_asc:  'price ASC',
  price_desc: 'price DESC',
  newest:     'id DESC',
};

const list = async ({
  category, brand, gender, minPrice, maxPrice, sort, q,
  page = 1, limit = 12,
} = {}) => {
  const conditions = [];
  const params = [];

  // push ค่าลง params[] แล้วอ้างด้วย $N — ไม่ตัด string ตรงๆ
  if (category) {
    params.push(category);
    conditions.push(`c.slug = $${params.length}`);
  }
  if (brand) {
    params.push(brand);
    conditions.push(`b.slug = $${params.length}`);
  }
  if (gender) {
    params.push(gender);
    conditions.push(`p.gender = $${params.length}`);
  }
  if (minPrice != null) {
    params.push(minPrice);
    conditions.push(`p.price >= $${params.length}`);
  }
  if (maxPrice != null) {
    params.push(maxPrice);
    conditions.push(`p.price <= $${params.length}`);
  }
  if (q) {
    params.push(`%${q}%`);
    // $N ปรากฏสองครั้งในเงื่อนไขเดียว แต่ push ครั้งเดียว — valid ใน PostgreSQL
    conditions.push(`(p.name ILIKE $${params.length} OR p.description ILIKE $${params.length})`);
  }

  const where    = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const orderBy  = ORDER_MAP[sort] ?? 'id DESC';
  const offset   = (page - 1) * limit;

  params.push(limit);  const limitParam  = `$${params.length}`;
  params.push(offset);
  const offsetParam = `$${params.length}`;

  const { rows } = await query(`
    SELECT *, COUNT(*) OVER() AS total_count
    FROM (
      SELECT
        p.id, p.name, p.description, p.price, p.image_url,
        p.gender, p.shoe_type, p.weight_grams, p.drop_mm, p.created_at,
        c.slug AS category_slug, c.name AS category_name,
        b.slug AS brand_slug,   b.name AS brand_name,
        COALESCE(SUM(v.stock), 0) AS total_stock
      FROM products p
      JOIN      categories c ON c.id = p.category_id
      LEFT JOIN brands b     ON b.id = p.brand_id
      LEFT JOIN product_variants v ON v.product_id = p.id
      ${where}
      GROUP BY p.id, c.slug, c.name, b.slug, b.name
    ) sub
    ORDER BY ${orderBy}
    LIMIT ${limitParam} OFFSET ${offsetParam}
  `, params);

  const total = rows.length > 0 ? Number(rows[0].total_count) : 0;
  // ตัด total_count ออกจากแต่ละ row ก่อนส่งกลับ client
  const items = rows.map(({ total_count, ...rest }) => rest);

  return { items, total, page: Number(page), totalPages: Math.ceil(total / limit) };
};

const findById = async (id) => {
  const { rows } = await query(`
    SELECT
      p.id,
      p.name,
      p.description,
      p.price,
      p.image_url,
      p.gender,
      p.shoe_type,
      p.weight_grams,
      p.drop_mm,
      p.created_at,
      p.updated_at,
      c.slug AS category_slug,
      c.name AS category_name,
      b.slug AS brand_slug,
      b.name AS brand_name
    FROM products p
    JOIN      categories c ON c.id = p.category_id
    LEFT JOIN brands b     ON b.id = p.brand_id
    WHERE p.id = $1
  `, [id]);

  if (!rows[0]) return null;

  const product = rows[0];

  const { rows: variants } = await query(`
    SELECT
      id,
      size,
      sku,
      stock,
      price_override,
      COALESCE(price_override, $1) AS effective_price
    FROM product_variants
    WHERE product_id = $2
    ORDER BY size
  `, [product.price, id]);

  product.variants = variants;
  return product;
};

const create = async ({
  categoryId, brandId,
  name, description, price, imageUrl,
  gender, shoeType, weightGrams, dropMm,
}) => {
  const { rows } = await query(`
    INSERT INTO products
      (category_id, brand_id, name, description, price, image_url,
       gender, shoe_type, weight_grams, drop_mm)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *
  `, [categoryId, brandId, name, description, price, imageUrl,
      gender, shoeType, weightGrams, dropMm]);
  return rows[0];
};

const update = async (id, {
  categoryId, brandId,
  name, description, price, imageUrl,
  gender, shoeType, weightGrams, dropMm,
}) => {
  const { rows } = await query(`
    UPDATE products
    SET
      category_id  = COALESCE($2,  category_id),
      brand_id     = COALESCE($3,  brand_id),
      name         = COALESCE($4,  name),
      description  = COALESCE($5,  description),
      price        = COALESCE($6,  price),
      image_url    = COALESCE($7,  image_url),
      gender       = COALESCE($8,  gender),
      shoe_type    = COALESCE($9,  shoe_type),
      weight_grams = COALESCE($10, weight_grams),
      drop_mm      = COALESCE($11, drop_mm),
      updated_at   = NOW()
    WHERE id = $1
    RETURNING *
  `, [id, categoryId, brandId, name, description, price, imageUrl,
      gender, shoeType, weightGrams, dropMm]);
  return rows[0] || null;
};

const remove = async (id) => {
  const { rows } = await query(
    'DELETE FROM products WHERE id = $1 RETURNING id',
    [id],
  );
  return rows[0] || null;
};

const addVariant = async (productId, { size, sku, stock, priceOverride }) => {
  const { rows } = await query(
    `INSERT INTO product_variants (product_id, size, sku, stock, price_override)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [productId, size, sku, stock, priceOverride || null],
  );
  return rows[0];
};

const updateVariant = async (id, { stock, priceOverride }) => {
  const { rows } = await query(
    `UPDATE product_variants
     SET stock = COALESCE($1, stock), price_override = $2
     WHERE id = $3 RETURNING *`,
    [stock ?? null, priceOverride ?? null, id],
  );
  return rows[0] || null;
};

const deleteVariant = async (id) => {
  const { rows } = await query(
    'DELETE FROM product_variants WHERE id = $1 RETURNING id',
    [id],
  );
  return rows[0] || null;
};

// ดึง stock + ราคาปัจจุบันของ variants หลายตัวพร้อมกัน (ใช้โดย cart validation)
const findVariantsByIds = async (ids) => {
  const { rows } = await query(
    `SELECT pv.id, pv.stock, COALESCE(pv.price_override, p.price) AS price
     FROM product_variants pv
     JOIN products p ON p.id = pv.product_id
     WHERE pv.id = ANY($1::int[])`,
    [ids],
  );
  return rows;
};

module.exports = { list, findById, create, update, remove, findVariantsByIds, addVariant, updateVariant, deleteVariant };
