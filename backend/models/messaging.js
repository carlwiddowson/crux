const pool = require('../config/db');

const Message = {
  async create({ subject, message, from_user_id, to_user_id, archive, organization_id }) {
    const query = `
      INSERT INTO messaging (subject, message, from_user_id, to_user_id, archive, organization_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;
    const values = [subject, message, from_user_id, to_user_id, archive, organization_id];
    try {
      const res = await pool.query(query, values);
      return res.rows[0];
    } catch (error) {
      throw new Error(`Error creating message: ${error.message}`);
    }
  },

  async findAll() {
    const query = 'SELECT * FROM messaging;';
    try {
      const res = await pool.query(query);
      return res.rows;
    } catch (error) {
      throw new Error(`Error fetching messages: ${error.message}`);
    }
  },

  async findById(message_id) {
    const query = 'SELECT * FROM messaging WHERE message_id = $1;';
    try {
      const res = await pool.query(query, [message_id]);
      return res.rows[0];
    } catch (error) {
      throw new Error(`Error fetching message by ID: ${error.message}`);
    }
  },
};

module.exports = Message;