const pool = require('../config/db');

const Wallet = {
  async create({ name, wallet_r, wallet_s, group_id, organization_id }) {
    const query = `
      INSERT INTO wallets (name, wallet_r, wallet_s, group_id, organization_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const values = [name, wallet_r, wallet_s, group_id, organization_id];
    try {
      const res = await pool.query(query, values);
      return res.rows[0];
    } catch (error) {
      throw new Error(`Error creating wallet: ${error.message}`);
    }
  },

  async findAll() {
    const query = 'SELECT * FROM wallets;';
    try {
      const res = await pool.query(query);
      return res.rows;
    } catch (error) {
      throw new Error(`Error fetching wallets: ${error.message}`);
    }
  },

  async findById(wallet_id) {
    const query = 'SELECT * FROM wallets WHERE wallet_id = $1;';
    try {
      const res = await pool.query(query, [wallet_id]);
      return res.rows[0];
    } catch (error) {
      throw new Error(`Error fetching wallet by ID: ${error.message}`);
    }
  },
};

module.exports = Wallet;