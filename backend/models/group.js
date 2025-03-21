const pool = require('../config/db');

const Group = {
  async create({ term, organization_id }) {
    const query = `
      INSERT INTO "group" (term, organization_id)
      VALUES ($1, $2)
      RETURNING *;
    `;
    const values = [term, organization_id];
    try {
      const res = await pool.query(query, values);
      return res.rows[0];
    } catch (error) {
      throw new Error(`Error creating group: ${error.message}`);
    }
  },

  async findAll() {
    const query = 'SELECT * FROM "group";';
    try {
      const res = await pool.query(query);
      return res.rows;
    } catch (error) {
      throw new Error(`Error fetching groups: ${error.message}`);
    }
  },

  async findById(group_id) {
    const query = 'SELECT * FROM "group" WHERE group_id = $1;';
    try {
      const res = await pool.query(query, [group_id]);
      return res.rows[0];
    } catch (error) {
      throw new Error(`Error fetching group by ID: ${error.message}`);
    }
  },
};

module.exports = Group;