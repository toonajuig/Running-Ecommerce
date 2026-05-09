const { query, getClient } = require('../config/db');

// Creates an order plus its items in one transaction. Locks the affected
// product rows so concurrent checkouts can't oversell stock.
const createWithItems = async ({ userId, items }) => {
  const client = await getClient();
  try {
    await client.query('BEGIN');

    const productIds = items.map((i) => i.productId);
    const { rows: products } = await client.query(
      'SELECT id, price, stock FROM products WHERE id = ANY($1::int[]) FOR UPDATE',
      [productIds]
    );
    const productMap = new Map(products.map((p) => [p.id, p]));

    let total = 0;
    for (const item of items) {
      const product = productMap.get(item.productId);
      if (!product) {
        const err = new Error(`Product ${item.productId} not found`);
        err.status = 400;
        throw err;
      }
      if (product.stock < item.quantity) {
        const err = new Error(`Insufficient stock for product ${item.productId}`);
        err.status = 400;
        throw err;
      }
      total += Number(product.price) * item.quantity;
    }

    const {
      rows: [order],
    } = await client.query(
      `INSERT INTO orders (user_id, total, status)
       VALUES ($1, $2, 'pending')
       RETURNING *`,
      [userId, total]
    );

    for (const item of items) {
      const product = productMap.get(item.productId);
      await client.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price)
         VALUES ($1, $2, $3, $4)`,
        [order.id, item.productId, item.quantity, product.price]
      );
      await client.query(
        'UPDATE products SET stock = stock - $1, updated_at = NOW() WHERE id = $2',
        [item.quantity, item.productId]
      );
    }

    await client.query('COMMIT');
    return order;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

const findByIdForUser = async (id, userId) => {
  const { rows } = await query(
    'SELECT * FROM orders WHERE id = $1 AND user_id = $2',
    [id, userId]
  );
  const order = rows[0];
  if (!order) return null;

  const { rows: itemRows } = await query(
    `SELECT oi.*, p.name AS product_name, p.image_url
     FROM order_items oi
     JOIN products p ON p.id = oi.product_id
     WHERE oi.order_id = $1`,
    [id]
  );
  order.items = itemRows;
  return order;
};

const listForUser = async (userId) => {
  const { rows } = await query(
    'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC',
    [userId]
  );
  return rows;
};

module.exports = { createWithItems, findByIdForUser, listForUser };
