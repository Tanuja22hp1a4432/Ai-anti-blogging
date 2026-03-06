const express = require('express');
const router = express.Router();
const { runScrapeJob } = require('../jobs/scrapeJob');
const { runEnrichJob } = require('../jobs/enrichJob');
const { runGenerateJob } = require('../jobs/generateJob');

router.post('/scrape', async (req, res) => {
  try {
    runScrapeJob(); // Run in background
    res.json({ message: 'Scrape job triggered' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/enrich', async (req, res) => {
  try {
    runEnrichJob(); // Run in background
    res.json({ message: 'Enrich job triggered' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/generate', async (req, res) => {
  try {
    runGenerateJob(); // Run in background
    res.json({ message: 'Generate job triggered' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
