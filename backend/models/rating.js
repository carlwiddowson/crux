const pool = require('../config/db');

const Rating = {
  async create({ number_of_stars, location_id, group_id, organization_id }) {
    const query = `
      INSERT INTO rating (number_of_stars, location_id, group_id, organization_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const values = [number_of_stars, location_id, group_id, organization_id];
    try {
      const res = await pool.query(query, values);
      return res.rows[0];
    } catch (error) {
      throw new Error(`Error creating rating: ${error.message}`);
    }
  },

  async findAll() {
    const query = 'SELECT * FROM rating;';
    try {
      const res = await pool.query(query);
      return res.rows;
    } catch (error) {
      throw new Error(`Error fetching ratings: ${error.message}`);
    }
  },

  async findById(rating_id) {
    const query = 'SELECT * FROM rating WHERE rating_id = $1;';
    try {
      const res = await pool.query(query, [rating_id]);
      return res.rows[0];
    } catch (error) {
      throw new Error(`Error fetching rating by ID: ${error.message}`);
    }
  },
};

module.exports = Rating;