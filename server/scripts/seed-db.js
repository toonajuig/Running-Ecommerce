require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { pool } = require('../src/config/db');

(async () => {
  try {
    const sqlPath = path.resolve(__dirname, '../../sql/seed.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    await pool.query(sql);
    console.log('Database seeded.');
  } catch (err) {
    console.error('Failed to seed database:', err);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
})();
