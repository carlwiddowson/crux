const pool = require('../config/db');

const Inventory = {
  async create({ quantity, grade, price_per_barrel, qty_min_for_purchase, closed_out, closed_out_date_time, user_id, location_id, group_id, organization_id }) {
    const query = `
      INSERT INTO inventory (quantity, grade, price_per_barrel, qty_min_for_purchase, closed_out, closed_out_date_time, user_id, location_id, group_id, organization_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *;
    `;
    const values = [quantity, grade, price_per_barrel, qty_min_for_purchase, closed_out, closed_out_date_time, user_id, location_id, group_id, organization_id];
    try {
      const res = await pool.query(query, values);
      return res.rows[0];
    } catch (error) {
      throw new Error(`Error creating inventory: ${error.message}`);
    }
  },

  async findAll() {
    const query = 'SELECT * FROM inventory;';
    try {
      const res = await pool.query(query);
      return res.rows;
    } catch (error) {
      throw new Error(`Error fetching inventory: ${error.message}`);
    }
  },

  async findById(inventory_id) {
    const query = 'SELECT * FROM inventory WHERE inventory_id = $1;';
    try {
      const res = await pool.query(query, [inventory_id]);
      return res.rows[0];
    } catch (error) {
      throw new Error(`Error fetching inventory by ID: ${error.message}`);
    }
  },
};

module.exports = Inventory;