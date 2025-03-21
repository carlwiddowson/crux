const pool = require('../config/db');

const User = {
  async create({ email, password, first_name, last_name, position, phone, user_active, verification_code, verification, location_id, group_id, permissions_id, organization_id }) {
    const query = `
      INSERT INTO users (email, password, first_name, last_name, position, phone, user_active, verification_code, verification, location_id, group_id, permissions_id, organization_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *;
    `;
    const values = [email, password, first_name, last_name, position, phone, user_active, verification_code, verification, location_id, group_id, permissions_id, organization_id];
    try {
      const res = await pool.query(query, values);
      return res.rows[0];
    } catch (error) {
      throw new Error(`Error creating user: ${error.message}`);
    }
  },

  async findAll() {
    const query = 'SELECT * FROM users;';
    try {
      const res = await pool.query(query);
      return res.rows;
    } catch (error) {
      throw new Error(`Error fetching users: ${error.message}`);
    }
  },

  async findById(user_id) {
    const query = 'SELECT * FROM users WHERE user_id = $1;';
    try {
      const res = await pool.query(query, [user_id]);
      return res.rows[0];
    } catch (error) {
      throw new Error(`Error fetching user by ID: ${error.message}`);
    }
  },
};

module.exports = User;