const db = require('../database/db');
const { searchGoogleForNews } = require('../scrapers/googleSearch');
const { scrapeArticleContent } = require('../scrapers/contentScraper');
const logger = require('../utils/logger');

async function runEnrichJob() {
  const logId = db.prepare(
    `INSERT INTO job_logs (job_name, status) VALUES ('enrich_google', 'running')`
  ).run().lastInsertRowid;

  try {
    // Get all pending raw news
    const pendingNews = db.prepare(`SELECT * FROM raw_news WHERE status='pending'`).all();
    logger.info(`Starting enrichment for ${pendingNews.length} items`);

    for (const news of pendingNews) {
      // Search Google for top relevant URLs
      const results = await searchGoogleForNews(news.title);

      for (const result of results) {
        const content = await scrapeArticleContent(result.url);
        if (content) {
          db.prepare(
            `INSERT OR IGNORE INTO buffer_articles (raw_news_id, source_url, source_title, content)
             VALUES (?, ?, ?, ?)`
          ).run(news.id, result.url, result.title, content);
        }
      }

      // Mark news as enriched
      db.prepare(`UPDATE raw_news SET status='enriched' WHERE id=?`).run(news.id);
    }

    db.prepare(`UPDATE job_logs SET status='success', ended_at=CURRENT_TIMESTAMP, message=? WHERE id=?`)
      .run(`Enriched ${pendingNews.length} news items`, logId);
  } catch (err) {
    logger.error('Enrich job failed', err.message);
    db.prepare(`UPDATE job_logs SET status='failed', ended_at=CURRENT_TIMESTAMP, message=? WHERE id=?`)
      .run(err.message, logId);
  }
}

module.exports = { runEnrichJob };
