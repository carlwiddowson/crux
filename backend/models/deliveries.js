const pool = require('../config/db');

const Delivery = {
  async create({ company, from_location, to_location, status, delivery_date, completion }) {
    const query = `
      INSERT INTO deliveries (company, from_location, to_location, status, delivery_date, completion)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;
    const values = [company, from_location, to_location, status, delivery_date, completion];
    try {
      const res = await pool.query(query, values);
      return res.rows[0];
    } catch (error) {
      throw new Error(`Error creating delivery: ${error.message}`);
    }
  },

  async findAll() {
    const query = 'SELECT * FROM deliveries ORDER BY id ASC;';
    try {
      console.log('Executing query:', query);
      const res = await pool.query(query);
      console.log('Query result:', res.rows);
      return res.rows;
    } catch (error) {
      throw new Error(`Error fetching deliveries: ${error.message}`);
    }
  },

  async findById(id) {
    const query = 'SELECT * FROM deliveries WHERE id = $1;';
    try {
      const res = await pool.query(query, [id]);
      return res.rows[0] || null;
    } catch (error) {
      throw new Error(`Error fetching delivery by ID: ${error.message}`);
    }
  },

  async updateById(id, { company, from_location, to_location, status, delivery_date, completion }) {
    const query = `
      UPDATE deliveries
      SET company = $1, from_location = $2, to_location = $3, status = $4, delivery_date = $5, completion = $6, updated_date_time = CURRENT_TIMESTAMP
      WHERE id = $7
      RETURNING *;
    `;
    const values = [company, from_location, to_location, status, delivery_date, completion, id];
    try {
      const res = await pool.query(query, values);
      return res.rows[0] || null;
    } catch (error) {
      throw new Error(`Error updating delivery: ${error.message}`);
    }
  },

  async deleteById(id) {
    const query = 'DELETE FROM deliveries WHERE id = $1 RETURNING *;';
    try {
      const res = await pool.query(query, [id]);
      return res.rows[0] || null;
    } catch (error) {
      throw new Error(`Error deleting delivery: ${error.message}`);
    }
  },
};

module.exports = Delivery;