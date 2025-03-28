// backend/routes/api.js
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const User = require('../models/users');
const Organization = require('../models/organization');
require('dotenv').config();

console.log('[api.js] JWT module:', jwt);

const router = express.Router();
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

// New endpoint to fetch the first user
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
  // ... (unchanged) ...
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

// ... rest of the routes unchanged ...

module.exports = router;