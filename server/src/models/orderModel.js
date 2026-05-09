const { query, getClient } = require('../config/db');

// Creates an order + items in one transaction.
// Locks the affected product_variant rows so concurrent checkouts can't oversell.
const createWithItems = async ({ userId, items }) => {
  const client = await getClient();
  try {
    await client.query('BEGIN');

    // Lock the variant rows first — prevents two users from buying the last unit
    // simultaneously. The FOR UPDATE makes any other transaction that touches
    // these rows wait until we COMMIT or ROLLBACK.
    const variantIds = items.map((i) => i.variantId);
    const { rows: variants } = await client.query(
      `SELECT pv.id, pv.stock,
              COALESCE(pv.price_override, p.price) AS price,
              p.name
       FROM product_variants pv
       JOIN products p ON p.id = pv.product_id
       WHERE pv.id = ANY($1::int[])
       FOR UPDATE`,
      [variantIds]
    );

    const variantMap = new Map(variants.map((v) => [v.id, v]));

    let total = 0;
    for (const item of items) {
      const variant = variantMap.get(item.variantId);
      if (!variant) {
        const err = new Error(`Variant ${item.variantId} not found`);
        err.status = 400;
        throw err;
      }
      if (variant.stock < item.quantity) {
        const err = new Error(`Insufficient stock for variant ${item.variantId}`);
        err.status = 400;
        throw err;
      }
      total += Number(variant.price) * item.quantity;
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
      const variant = variantMap.get(item.variantId);

      // Snapshot the price at purchase time — if the product price changes later,
      // historical orders still show what the customer actually paid.
      await client.query(
        `INSERT INTO order_items (order_id, variant_id, quantity, price)
         VALUES ($1, $2, $3, $4)`,
        [order.id, item.variantId, item.quantity, variant.price]
      );

      await client.query(
        `UPDATE product_variants SET stock = stock - $1 WHERE id = $2`,
        [item.quantity, item.variantId]
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
    `SELECT
       oi.id,
       oi.quantity,
       oi.price,
       pv.size,
       pv.sku,
       p.name  AS product_name,
       p.image_url
     FROM order_items oi
     JOIN product_variants pv ON pv.id = oi.variant_id
     JOIN products p          ON p.id  = pv.product_id
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

// admin: ดึงออเดอร์ทั้งหมดพร้อม user info
const listAll = async () => {
  const { rows } = await query(
    `SELECT o.*, u.name AS user_name, u.email AS user_email
     FROM orders o
     JOIN users u ON u.id = o.user_id
     ORDER BY o.created_at DESC`,
  );
  return rows;
};

// admin: เปลี่ยน status ได้ทุก order โดยไม่ตรวจ user_id
const updateStatusAdmin = async (id, status) => {
  const { rows } = await query(
    `UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
    [status, id],
  );
  return rows[0] || null;
};

const updateStatus = async (id, userId, status) => {
  const { rows } = await query(
    `UPDATE orders SET status = $1, updated_at = NOW()
     WHERE id = $2 AND user_id = $3
     RETURNING *`,
    [status, id, userId],
  );
  return rows[0] || null;
};

module.exports = { createWithItems, findByIdForUser, listForUser, updateStatus, listAll, updateStatusAdmin };
