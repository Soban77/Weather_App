const express = require('express');
const SavedWeather = require('../models/SavedWeather');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all saved weather for logged-in user
router.get('/', auth, (req, res) => {
  try {
    const entries = SavedWeather.findByUser(req.userId);
    res.json(entries);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Save a new weather entry
router.post('/', auth, (req, res) => {
  try {
    const { city, temperature, condition, icon } = req.body;
    if (!city || temperature === undefined || !condition || !icon) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const saved = SavedWeather.save(req.userId, city, temperature, condition, icon);
    res.status(201).json(saved);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete a saved weather entry
router.delete('/:id', auth, (req, res) => {
  try {
    const { id } = req.params;
    const result = SavedWeather.delete(id, req.userId);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Entry not found' });
    }
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;