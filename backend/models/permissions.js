const pool = require('../config/db');

const Permission = {
  async create({ term }) {
    const query = `
      INSERT INTO permissions (term)
      VALUES ($1)
      RETURNING *;
    `;
    const values = [term];
    try {
      const res = await pool.query(query, values);
      return res.rows[0];
    } catch (error) {
      throw new Error(`Error creating permission: ${error.message}`);
    }
  },

  async findAll() {
    const query = 'SELECT * FROM permissions;';
    try {
      const res = await pool.query(query);
      return res.rows;
    } catch (error) {
      throw new Error(`Error fetching permissions: ${error.message}`);
    }
  },

  async findById(permissions_id) {
    const query = 'SELECT * FROM permissions WHERE permissions_id = $1;';
    try {
      const res = await pool.query(query, [permissions_id]);
      return res.rows[0];
    } catch (error) {
      throw new Error(`Error fetching permission by ID: ${error.message}`);
    }
  },
};

module.exports = Permission;