const pool = require('../config/db');

const Branding = {
  async create({ url, organization_id }) {
    const query = `
      INSERT INTO branding (url, organization_id)
      VALUES ($1, $2)
      RETURNING *;
    `;
    const values = [url, organization_id];
    try {
      const res = await pool.query(query, values);
      return res.rows[0];
    } catch (error) {
      throw new Error(`Error creating branding: ${error.message}`);
    }
  },

  async findAll() {
    const query = 'SELECT * FROM branding;';
    try {
      const res = await pool.query(query);
      return res.rows;
    } catch (error) {
      throw new Error(`Error fetching branding: ${error.message}`);
    }
  },

  async findById(branding_id) {
    const query = 'SELECT * FROM branding WHERE branding_id = $1;';
    try {
      const res = await pool.query(query, [branding_id]);
      return res.rows[0];
    } catch (error) {
      throw new Error(`Error fetching branding by ID: ${error.message}`);
    }
  },
};

module.exports = Branding;