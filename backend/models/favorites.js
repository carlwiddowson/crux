const pool = require('../config/db');

const Favorite = {
  async create({ location_id, user_id }) {
    const query = `
      INSERT INTO favorites (location_id, user_id)
      VALUES ($1, $2)
      RETURNING *;
    `;
    const values = [location_id, user_id];
    try {
      const res = await pool.query(query, values);
      return res.rows[0];
    } catch (error) {
      throw new Error(`Error creating favorite: ${error.message}`);
    }
  },

  async findAll() {
    const query = 'SELECT * FROM favorites;';
    try {
      const res = await pool.query(query);
      return res.rows;
    } catch (error) {
      throw new Error(`Error fetching favorites: ${error.message}`);
    }
  },

  async findById(favorite_id) {
    const query = 'SELECT * FROM favorites WHERE favorite_id = $1;';
    try {
      const res = await pool.query(query, [favorite_id]);
      return res.rows[0];
    } catch (error) {
      throw new Error(`Error fetching favorite by ID: ${error.message}`);
    }
  },
};

module.exports = Favorite;