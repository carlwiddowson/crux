const pool = require('../config/db');

const Transaction = {
  async create({ xrpl_hash, barrels, note, status_id, archived, wallet_id, user_id, group_id, organization_id }) {
    const query = `
      INSERT INTO transactions (xrpl_hash, barrels, note, status_id, archived, wallet_id, user_id, group_id, organization_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *;
    `;
    const values = [xrpl_hash, barrels, note, status_id, archived, wallet_id, user_id, group_id, organization_id];
    try {
      const res = await pool.query(query, values);
      return res.rows[0];
    } catch (error) {
      throw new Error(`Error creating transaction: ${error.message}`);
    }
  },

  async findAll() {
    const query = 'SELECT * FROM transactions;';
    try {
      const res = await pool.query(query);
      return res.rows;
    } catch (error) {
      throw new Error(`Error fetching transactions: ${error.message}`);
    }
  },

  async findById(transaction_id) {
    const query = 'SELECT * FROM transactions WHERE transaction_id = $1;';
    try {
      const res = await pool.query(query, [transaction_id]);
      return res.rows[0];
    } catch (error) {
      throw new Error(`Error fetching transaction by ID: ${error.message}`);
    }
  },
};

module.exports = Transaction;