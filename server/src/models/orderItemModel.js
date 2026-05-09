const { query } = require('../config/db');

const findByOrderId = async (orderId) => {
  const { rows } = await query(
    `SELECT oi.*, p.name AS product_name, p.image_url
     FROM order_items oi
     JOIN products p ON p.id = oi.product_id
     WHERE oi.order_id = $1`,
    [orderId]
  );
  return rows;
};

module.exports = { findByOrderId };
