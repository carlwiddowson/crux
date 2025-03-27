// backend/server.js
const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/api');
const path = require('path');
require('dotenv').config();

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173', // Vercel env var or local
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use('/api', apiRoutes);

// Serve static files from dist
app.use(express.static(path.join(__dirname, '../dist')));

// Handle all other routes by serving index.html for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

module.exports = app; // Export for Vercel serverless