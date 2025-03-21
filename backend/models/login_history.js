const pool = require('../config/db');

const LoginHistory = {
  async create({ user_id, ip_address }) {
    const query = `
      INSERT INTO login_history (user_id, ip_address)
      VALUES ($1, $2)
      RETURNING *;
    `;
    const values = [user_id, ip_address];
    try {
      const res = await pool.query(query, values);
      return res.rows[0];
    } catch (error) {
      throw new Error(`Error creating login history: ${error.message}`);
    }
  },

  async findAll() {
    const query = 'SELECT * FROM login_history;';
    try {
      const res = await pool.query(query);
      return res.rows;
    } catch (error) {
      throw new Error(`Error fetching login history: ${error.message}`);
    }
  },

  async findById(login_history_id) {
    const query = 'SELECT * FROM login_history WHERE login_history_id = $1;';
    try {
      const res = await pool.query(query, [login_history_id]);
      return res.rows[0];
    } catch (error) {
      throw new Error(`Error fetching login history by ID: ${error.message}`);
    }
  },
};

module.exports = LoginHistory;