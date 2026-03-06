const express = require('express');
const router = express.Router();
const db = require('../database/db');

// Get all blogs (including drafts)
router.get('/blogs', (req, res) => {
  try {
    const blogs = db.prepare('SELECT * FROM published_blogs ORDER BY created_at DESC').all();
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single blog for edit
router.get('/blogs/:id', (req, res) => {
  try {
    const blog = db.prepare('SELECT * FROM published_blogs WHERE id = ?').get(req.params.id);
    if (!blog) return res.status(404).json({ error: 'Blog not found' });
    res.json(blog);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update blog
router.put('/blogs/:id', (req, res) => {
  const { title, summary, content, category, tags, is_published } = req.body;
  
  try {
    db.prepare(`
      UPDATE published_blogs 
      SET title = ?, summary = ?, content = ?, category = ?, tags = ?, is_published = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(title, summary, content, category, JSON.stringify(tags), is_published ? 1 : 0, req.params.id);
    
    res.json({ message: 'Blog updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Toggle publish
router.patch('/blogs/:id/publish', (req, res) => {
  const { is_published } = req.body;
  const published_at = is_published ? new Date().toISOString() : null;

  try {
    db.prepare(`UPDATE published_blogs SET is_published = ?, published_at = ? WHERE id = ?`)
      .run(is_published ? 1 : 0, published_at, req.params.id);
    res.json({ message: `Blog ${is_published ? 'published' : 'unsupported'}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete blog
router.delete('/blogs/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM published_blogs WHERE id = ?').run(req.params.id);
    res.json({ message: 'Blog deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Buffer articles
router.get('/buffer', (req, res) => {
  try {
    const articles = db.prepare(`
      SELECT ba.*, rn.title as raw_title 
      FROM buffer_articles ba
      JOIN raw_news rn ON ba.raw_news_id = rn.id
      ORDER BY ba.scraped_at DESC
    `).all();
    res.json(articles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Raw news
router.get('/raw-news', (req, res) => {
  try {
    const news = db.prepare('SELECT * FROM raw_news ORDER BY scraped_at DESC').all();
    res.json(news);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Job logs
router.get('/logs', (req, res) => {
  try {
    const logs = db.prepare('SELECT * FROM job_logs ORDER BY started_at DESC LIMIT 50').all();
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Dashboard stats
router.get('/stats', (req, res) => {
  try {
    const totalBlogs = db.prepare('SELECT COUNT(*) as count FROM published_blogs').get().count;
    const publishedBlogs = db.prepare('SELECT COUNT(*) as count FROM published_blogs WHERE is_published = 1').get().count;
    const pendingNews = db.prepare("SELECT COUNT(*) as count FROM raw_news WHERE status = 'pending'").get().count;
    const lastJob = db.prepare('SELECT * FROM job_logs ORDER BY started_at DESC LIMIT 1').get();

    res.json({
      totalBlogs,
      publishedBlogs,
      pendingNews,
      lastJob
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
