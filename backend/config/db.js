// backend/config/db.js
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_i6zJMRrU5THD@ep-little-silence-a42gcnry-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require',
  ssl: {
    rejectUnauthorized: false, // Required for Neon if self-signed certs are used
  },
});

pool.on('connect', () => {
  console.log('[db.js] Successfully connected to Neon PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('[db.js] Database connection error:', err.stack);
});

module.exports = pool;