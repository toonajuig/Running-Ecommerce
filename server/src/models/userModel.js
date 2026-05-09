const { query } = require('../config/db');

const PUBLIC_COLUMNS = 'id, name, email, role, created_at, updated_at';

const findById = async (id) => {
  const { rows } = await query(`SELECT ${PUBLIC_COLUMNS} FROM users WHERE id = $1`, [id]);
  return rows[0] || null;
};

const findByEmail = async (email) => {
  const { rows } = await query('SELECT * FROM users WHERE email = $1', [email]);
  return rows[0] || null;
};

const create = async ({ name, email, passwordHash, role = 'customer' }) => {
  const { rows } = await query(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES ($1, $2, $3, $4)
     RETURNING ${PUBLIC_COLUMNS}`,
    [name, email, passwordHash, role]
  );
  return rows[0];
};

const list = async () => {
  const { rows } = await query(`SELECT ${PUBLIC_COLUMNS} FROM users ORDER BY id`);
  return rows;
};

module.exports = { findById, findByEmail, create, list };
