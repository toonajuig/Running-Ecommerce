const { query } = require('../config/db');

const list = async () => {
  const { rows } = await query('SELECT * FROM products ORDER BY id DESC');
  return rows;
};

const findById = async (id) => {
  const { rows } = await query('SELECT * FROM products WHERE id = $1', [id]);
  return rows[0] || null;
};

const create = async ({ name, description, price, stock, imageUrl }) => {
  const { rows } = await query(
    `INSERT INTO products (name, description, price, stock, image_url)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [name, description, price, stock, imageUrl]
  );
  return rows[0];
};

const update = async (id, { name, description, price, stock, imageUrl }) => {
  const { rows } = await query(
    `UPDATE products
     SET name        = COALESCE($2, name),
         description = COALESCE($3, description),
         price       = COALESCE($4, price),
         stock       = COALESCE($5, stock),
         image_url   = COALESCE($6, image_url),
         updated_at  = NOW()
     WHERE id = $1
     RETURNING *`,
    [id, name, description, price, stock, imageUrl]
  );
  return rows[0] || null;
};

const remove = async (id) => {
  const { rows } = await query('DELETE FROM products WHERE id = $1 RETURNING id', [id]);
  return rows[0] || null;
};

module.exports = { list, findById, create, update, remove };
