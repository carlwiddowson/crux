const pool = require('../config/db');

const Status = {
  async create({ status_term }) {
    const query = `
      INSERT INTO status (status_term)
      VALUES ($1)
      RETURNING *;
    `;
    const values = [status_term];
    try {
      const res = await pool.query(query, values);
      return res.rows[0];
    } catch (error) {
      throw new Error(`Error creating status: ${error.message}`);
    }
  },

  async findAll() {
    const query = 'SELECT * FROM status;';
    try {
      const res = await pool.query(query);
      return res.rows;
    } catch (error) {
      throw new Error(`Error fetching statuses: ${error.message}`);
    }
  },

  async findById(status_id) {
    const query = 'SELECT * FROM status WHERE status_id = $1;';
    try {
      const res = await pool.query(query, [status_id]);
      return res.rows[0];
    } catch (error) {
      throw new Error(`Error fetching status by ID: ${error.message}`);
    }
  },
};

module.exports = Status;