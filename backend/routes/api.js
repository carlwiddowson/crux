// backend/routes/api.js
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const User = require('../models/users');
const Organization = require('../models/organization'); // Changed to singular
require('dotenv').config();


const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'ff318998f1cc08919eed3fe9be7394168c63e937f1cc12af8c047addb8dbf580';

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ error: 'Invalid token.' });
  }
};

router.post('/register', async (req, res) => {
  const { organization, user } = req.body;
  try {
    if (!organization.name || !user.email || !user.password) {
      return res.status(400).json({ error: 'Company name, email, and password are required.' });
    }
    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [user.email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User with this email already exists.' });
    }
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(user.password, saltRounds);
    const newOrg = await Organization.create({
      name: organization.name,
      buyer_type: organization.buyer_type || 0,
      email: organization.email,
    });
    const newUser = await User.create({
      email: user.email,
      password: hashedPassword,
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      position: user.position || '',
      phone: user.phone || '',
      user_active: user.user_active !== undefined ? user.user_active : true,
      verification_code: null,
      verification: false,
      location_id: null,
      group_id: null,
      permissions_id: null,
      organization_id: newOrg.organization_id,
    });
    res.status(201).json({
      message: 'Registration successful. Please log in.',
      user: { email: newUser.email, first_name: newUser.first_name, last_name: newUser.last_name },
    });
  } catch (error) {
    console.error('Error during registration:', error.message);
    res.status(500).json({ error: 'Failed to register: ' + error.message });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = userResult.rows[0];
    if (!user) return res.status(401).json({ error: 'Invalid credentials.' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials.' });
    const token = jwt.sign(
      { user_id: user.user_id, email: user.email, organization_id: user.organization_id },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
    res.json({ token });
  } catch (error) {
    console.error('Error during login:', error.message);
    res.status(500).json({ error: 'Failed to login: ' + error.message });
  }
});

router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    const user = await pool.query('SELECT email, first_name, last_name FROM users WHERE user_id = $1', [req.user.user_id]);
    if (!user.rows[0]) return res.status(404).json({ error: 'User not found.' });
    res.json({ user: user.rows[0], message: 'Welcome to your dashboard!' });
  } catch (error) {
    console.error('Error fetching dashboard data:', error.message);
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

// GET /api/deliveries
router.get('/deliveries', authenticateToken, async (req, res) => {
  try {
    console.log('[api.js] Fetching deliveries');
    const result = await pool.query(`
      SELECT 
        id, company, from_location, to_location, status, delivery_date, completion,
        created_date_time, updated_date_time
      FROM deliveries
      ORDER BY id ASC
    `);
    console.log('[api.js] Deliveries fetched from DB:', result.rows);
    res.json(result.rows);
  } catch (error) {
    console.error('[api.js] Error fetching deliveries:', error.message);
    res.status(500).json({ error: 'Failed to fetch deliveries: ' + error.message });
  }
});

module.exports = router;