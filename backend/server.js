// backend/server.js
const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/api');
const path = require('path');
require('dotenv').config();

console.log('[server.js] JWT_SECRET:', process.env.JWT_SECRET); // Debug log

const app = express();

app.use(cors({
  origin: 'https://crux-omega.vercel.app',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.use(express.json());
app.use('/api', apiRoutes);

app.get('/test', (req, res) => {
  res.json({ message: 'Server is running' });
});

app.use(express.static(path.join(__dirname, '../dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;