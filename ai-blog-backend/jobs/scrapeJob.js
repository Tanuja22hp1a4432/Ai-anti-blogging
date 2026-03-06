const db = require('../database/db');
const { scrapeFirstTOINews } = require('../scrapers/toiScraper');
const logger = require('../utils/logger');

async function runScrapeJob() {
  const logId = db.prepare(
    `INSERT INTO job_logs (job_name, status) VALUES ('scrape_toi', 'running')`
  ).run().lastInsertRowid;

  try {
    const news = await scrapeFirstTOINews();
    if (!news || !news.url) throw new Error('No news item found or scrape failed');

    // Insert only if URL not already scraped
    const existing = db.prepare(`SELECT id FROM raw_news WHERE url = ?`).get(news.url);
    if (!existing) {
      db.prepare(`INSERT INTO raw_news (title, url) VALUES (?, ?)`).run(news.title, news.url);
      logger.info(`Saved new raw news: ${news.title}`);
    } else {
      logger.info(`News already exists: ${news.title}`);
    }

    db.prepare(`UPDATE job_logs SET status='success', ended_at=CURRENT_TIMESTAMP, message=? WHERE id=?`)
      .run(`Scraped: "${news.title}"`, logId);
  } catch (err) {
    logger.error('Scrape job failed', err.message);
    db.prepare(`UPDATE job_logs SET status='failed', ended_at=CURRENT_TIMESTAMP, message=? WHERE id=?`)
      .run(err.message, logId);
  }
}

module.exports = { runScrapeJob };
