const pool = require('../config/db');

const Ad = {
  async create({ image_file, title, user_id, location_id, group_id, organization_id }) {
    const query = `
      INSERT INTO ads (image_file, title, user_id, location_id, group_id, organization_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;
    const values = [image_file, title, user_id, location_id, group_id, organization_id];
    try {
      const res = await pool.query(query, values);
      return res.rows[0];
    } catch (error) {
      throw new Error(`Error creating ad: ${error.message}`);
    }
  },

  async findAll() {
    const query = 'SELECT * FROM ads;';
    try {
      const res = await pool.query(query);
      return res.rows;
    } catch (error) {
      throw new Error(`Error fetching ads: ${error.message}`);
    }
  },

  async findById(ad_id) {
    const query = 'SELECT * FROM ads WHERE ad_id = $1;';
    try {
      const res = await pool.query(query, [ad_id]);
      return res.rows[0];
    } catch (error) {
      throw new Error(`Error fetching ad by ID: ${error.message}`);
    }
  },
};

module.exports = Ad;