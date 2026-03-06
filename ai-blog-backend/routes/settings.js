const express = require('express');
const router = express.Router();
const db = require('../database/db');

// Get all settings
router.get('/', (req, res) => {
  try {
    const settings = db.prepare('SELECT * FROM settings').all();
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update setting
router.put('/', (req, res) => {
  const { key, value } = req.body;
  try {
    db.prepare('UPDATE settings SET value = ?, updated_at = CURRENT_TIMESTAMP WHERE key = ?')
      .run(value, key);
    res.json({ message: `Setting ${key} updated` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
