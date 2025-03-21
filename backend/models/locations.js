const pool = require('../config/db');

const Location = {
  async create({ name, address_1, address_2, city, state_province_region, postal_code, country, latitude, longitude, location_status, user_id, organization_id, group_id }) {
    const query = `
      INSERT INTO locations (name, address_1, address_2, city, state_province_region, postal_code, country, latitude, longitude, location_status, user_id, organization_id, group_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *;
    `;
    const values = [name, address_1, address_2, city, state_province_region, postal_code, country, latitude, longitude, location_status, user_id, organization_id, group_id];
    try {
      const res = await pool.query(query, values);
      return res.rows[0];
    } catch (error) {
      throw new Error(`Error creating location: ${error.message}`);
    }
  },

  async findAll() {
    const query = 'SELECT * FROM locations;';
    try {
      const res = await pool.query(query);
      return res.rows;
    } catch (error) {
      throw new Error(`Error fetching locations: ${error.message}`);
    }
  },

  async findById(location_id) {
    const query = 'SELECT * FROM locations WHERE location_id = $1;';
    try {
      const res = await pool.query(query, [location_id]);
      return res.rows[0];
    } catch (error) {
      throw new Error(`Error fetching location by ID: ${error.message}`);
    }
  },
};

module.exports = Location;