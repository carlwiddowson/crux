// backend/routes/api.js
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const User = require('../models/users');
const Organization = require('../models/organization');
require('dotenv').config();

console.log('[api.js] JWT module:', jwt);

// Define router at the top
const router = express.Router();

// Set JWT_SECRET
const JWT_SECRET = process.env.JWT_SECRET || 'rtIxhQbDEPA4IBViiisIwE619dgCYjAWemJNfnDqZP8=';
console.log('[api.js] JWT_SECRET:', JWT_SECRET);

const authenticateToken = (req, res, next) => {
  const token = req.cookies.authToken;
  if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ error: 'Invalid token.' });
  }
};

// Endpoint to fetch the first user
router.get('/first-user', async (req, res) => {
  try {
    console.log('[api.js] Fetching first user...');
    const userResult = await pool.query('SELECT * FROM users LIMIT 1');
    const user = userResult.rows[0];
    if (!user) {
      return res.status(404).json({ error: 'No users found' });
    }
    console.log('[api.js] First user found:', user);
    res.json({ email: user.email });
  } catch (error) {
    console.error('[api.js] Error fetching first user:', error.message, error.stack);
    res.status(500).json({ error: 'Failed to fetch first user: ' + error.message });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { first_name, last_name, email, password, organization_id } = req.body;
    console.log('[api.js] Register attempt for email:', email);

    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('[api.js] Password hashed');

    const newUser = await pool.query(
      'INSERT INTO users (first_name, last_name, email, password, organization_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [first_name, last_name, email, hashedPassword, organization_id]
    );
    console.log('[api.js] New user created:', newUser.rows[0]);

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('[api.js] Register error:', error.message, error.stack);
    res.status(500).json({ error: 'Registration failed: ' + error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('[api.js] Login attempt for email:', email);

    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = userResult.rows[0];
    console.log('[api.js] User found:', user);

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log('[api.js] Comparing password...');
    const passwordMatch = await bcrypt.compare(password, user.password);
    console.log('[api.js] Password match:', passwordMatch);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log('[api.js] Generating token with JWT_SECRET:', JWT_SECRET);
    const token = jwt.sign(
      { user_id: user.user_id, email: user.email, organization_id: user.organization_id },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
    console.log('[api.js] Token generated:', token);

    console.log('[api.js] Setting cookie...');
    res.cookie('authToken', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'Strict',
      maxAge: 3600000,
    });
    console.log('[api.js] Cookie set');

    res.json({ message: 'Login successful' });
  } catch (error) {
    console.error('[api.js] Login error:', error.message, error.stack);
    res.status(500).json({ error: 'Login failed: ' + error.message });
  }
});

router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    console.log('[api.js] Fetching dashboard data for user:', req.user.email);

    // Fetch user info
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [req.user.email]);
    const user = userResult.rows[0];
    if (!user) throw new Error('User not found');

    // Fetch delivery status counts
    const deliveryResult = await pool.query(`
      SELECT status, COUNT(*) as count 
      FROM deliveries 
      GROUP BY status
    `);
    const deliveryStatusCounts = {
      Pending: 0,
      'In-transit': 0,
      Delivered: 0,
      Cancelled: 0,
    };
    deliveryResult.rows.forEach(row => {
      if (deliveryStatusCounts.hasOwnProperty(row.status)) {
        deliveryStatusCounts[row.status] = parseInt(row.count);
      }
    });

    // Placeholder for wallet data (update with real data if available)
    const walletBalance = 1000;
    const escrowLocked = 50;
    const escrowReleased = 200;

    const responseData = {
      user: {
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        organization_id: user.organization_id,
      },
      message: 'Welcome back to CruX!',
      wallet: {
        balance: walletBalance,
        escrow_locked: escrowLocked,
        escrow_released: escrowReleased,
      },
      delivery_status: deliveryStatusCounts,
    };

    console.log('[api.js] Dashboard response data:', responseData);
    res.json(responseData);
  } catch (error) {
    console.error('[api.js] Error fetching dashboard data:', error.message);
    res.status(500).json({ error: 'Failed to fetch dashboard data: ' + error.message });
  }
});

router.get('/deliveries', authenticateToken, async (req, res) => {
  try {
    console.log('[api.js] Fetching deliveries');
    const result = await pool.query('SELECT * FROM deliveries ORDER BY id ASC');
    res.json(result.rows);
  } catch (error) {
    console.error('[api.js] Error fetching deliveries:', error.message);
    res.status(500).json({ error: 'Failed to fetch deliveries: ' + error.message });
  }
});

module.exports = router;