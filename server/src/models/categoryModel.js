const { query } = require('../config/db');

const list = async () => {
  const { rows } = await query('SELECT id, slug, name FROM categories ORDER BY name');
  return rows;
};

module.exports = { list };
