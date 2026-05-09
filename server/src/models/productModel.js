const { query } = require('../config/db');

const list = async () => {
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
      c.slug AS category_slug,
      c.name AS category_name,
      b.slug AS brand_slug,
      b.name AS brand_name,
      COALESCE(SUM(v.stock), 0) AS total_stock
    FROM products p
    JOIN      categories c ON c.id = p.category_id
    LEFT JOIN brands b     ON b.id = p.brand_id
    LEFT JOIN product_variants v ON v.product_id = p.id
    GROUP BY p.id, c.slug, c.name, b.slug, b.name
    ORDER BY p.id DESC
  `);
  return rows;
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

module.exports = { list, findById, create, update, remove };
