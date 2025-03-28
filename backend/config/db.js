// backend/config/db.js
const { Pool } = require('pg');
require('dotenv').config();

console.log('[db.js] DATABASE_URL from process.env:', process.env.DATABASE_URL); // Debug log

const connectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_i6zJMRrU5THD@ep-little-silence-a42gcnry-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require';
console.log('[db.js] Using connectionString:', connectionString); // Debug log

const pool = new Pool({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
});

pool.on('connect', () => {
  console.log('[db.js] Successfully connected to Neon PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('[db.js] Database connection error:', err.stack);
});

// Test connection on startup
(async () => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    console.log('[db.js] Test query result:', result.rows[0]);
    client.release();
  } catch (error) {
    console.error('[db.js] Test connection error:', error.stack);
  }
})();

module.exports = pool;