const pool = require('../config/db');

const Organization = {
  async create({ name, buyer_type, email }) {
    const query = `
      INSERT INTO organization (name, buyer_type, email)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    const values = [name, buyer_type, email];
    try {
      const res = await pool.query(query, values);
      return res.rows[0];
    } catch (error) {
      throw new Error(`Error creating organization: ${error.message}`);
    }
  },

  async findAll() {
    const query = 'SELECT * FROM organization;';
    try {
      const res = await pool.query(query);
      return res.rows;
    } catch (error) {
      throw new Error(`Error fetching organizations: ${error.message}`);
    }
  },

  async findById(organization_id) {
    const query = 'SELECT * FROM organization WHERE organization_id = $1;';
    try {
      const res = await pool.query(query, [organization_id]);
      return res.rows[0];
    } catch (error) {
      throw new Error(`Error fetching organization by ID: ${error.message}`);
    }
  },
};

module.exports = Organization;