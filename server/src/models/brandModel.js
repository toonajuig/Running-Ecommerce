const { query } = require('../config/db');

const list = async () => {
  const { rows } = await query('SELECT id, slug, name, logo_url FROM brands ORDER BY name');
  return rows;
};

module.exports = { list };
