const express = require('express');
const router = express.Router();
const db = require('../database/db');

// List published blogs (paginated)
router.get('/', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const category = req.query.category;
  const offset = (page - 1) * limit;

  let query = 'SELECT * FROM published_blogs WHERE is_published = 1';
  let params = [];

  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }

  query += ' ORDER BY published_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  try {
    const blogs = db.prepare(query).all(...params);
    const total = db.prepare(`SELECT COUNT(*) as count FROM published_blogs WHERE is_published = 1 ${category ? 'AND category = ?' : ''}`).get(...(category ? [category] : [])).count;

    res.json({
      blogs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// List all categories
router.get('/categories', (req, res) => {
  try {
    const categories = db.prepare('SELECT DISTINCT category FROM published_blogs WHERE is_published = 1 AND category IS NOT NULL').all();
    res.json(categories.map(c => c.category));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Search blogs
router.get('/search', (req, res) => {
  const q = req.query.q;
  if (!q) return res.json([]);

  try {
    const blogs = db.prepare(
      `SELECT * FROM published_blogs 
       WHERE is_published = 1 AND (title LIKE ? OR summary LIKE ?) 
       ORDER BY published_at DESC`
    ).all(`%${q}%`, `%${q}%`);
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single blog by slug
router.get('/:slug', (req, res) => {
  try {
    const blog = db.prepare('SELECT * FROM published_blogs WHERE slug = ? AND is_published = 1').get(req.params.slug);
    if (!blog) return res.status(404).json({ error: 'Blog not found' });
    res.json(blog);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
