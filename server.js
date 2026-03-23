require('dotenv').config();
const express = require('express');
const path = require('path');
const authRoutes = require('./routes/auth');
const weatherRoutes = require('./routes/weather');
const savedRoutes = require('./routes/saved');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/saved', savedRoutes);

// Catch-all route for SPA - send index.html for all non-API routes
app.use((req, res, next) => {
  // Skip if it's an API route
  if (req.path.startsWith('/api/')) {
    return next();
  }
  // Send index.html for all other routes
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});