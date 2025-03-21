const pool = require('../config/db');

const History = {
  async create({ location_id, user_id, transaction_id }) {
    const query = `
      INSERT INTO history (location_id, user_id, transaction_id)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    const values = [location_id, user_id, transaction_id];
    try {
      const res = await pool.query(query, values);
      return res.rows[0];
    } catch (error) {
      throw new Error(`Error creating history: ${error.message}`);
    }
  },

  async findAll() {
    const query = 'SELECT * FROM history;';
    try {
      const res = await pool.query(query);
      return res.rows;
    } catch (error) {
      throw new Error(`Error fetching history: ${error.message}`);
    }
  },

  async findById(history_id) {
    const query = 'SELECT * FROM history WHERE history_id = $1;';
    try {
      const res = await pool.query(query, [history_id]);
      return res.rows[0];
    } catch (error) {
      throw new Error(`Error fetching history by ID: ${error.message}`);
    }
  },
};

module.exports = History;