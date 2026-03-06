const db = require('../database/db');
const { generateWithGroq } = require('../llm/grokClient');
const { BLOG_SYSTEM_PROMPT, buildBlogUserPrompt } = require('../llm/prompts');
const logger = require('../utils/logger');

async function runGenerateJob() {
  const logId = db.prepare(
    `INSERT INTO job_logs (job_name, status) VALUES ('generate_blog', 'running')`
  ).run().lastInsertRowid;

  try {
    // Get all enriched news that don't have a blog yet
    const enrichedNews = db.prepare(`
      SELECT rn.* FROM raw_news rn
      LEFT JOIN published_blogs pb ON pb.raw_news_id = rn.id
      WHERE rn.status = 'enriched' AND pb.id IS NULL
    `).all();

    logger.info(`Generating blogs for ${enrichedNews.length} enriched news items`);
    let generatedCount = 0;

    for (const news of enrichedNews) {
      const sources = db.prepare(
        `SELECT source_title, content FROM buffer_articles 
         WHERE raw_news_id = ? AND content IS NOT NULL LIMIT 4`
      ).all(news.id);

      if (sources.length === 0) {
        logger.warn(`No sources found for news item: ${news.title}`);
        continue;
      }

      const userPrompt = buildBlogUserPrompt(news.title, sources);
      const rawResponse = await generateWithGroq(BLOG_SYSTEM_PROMPT, userPrompt);

      // Parse JSON response
      let blog;
      try {
        const cleaned = rawResponse.replace(/```json|```/g, '').trim();
        blog = JSON.parse(cleaned);
      } catch (err) {
        logger.error(`Failed to parse LLM JSON response for: ${news.title}`, err.message);
        continue;
      }

      // Check settings for auto_publish
      const autoPublishRow = db.prepare(`SELECT value FROM settings WHERE key='auto_publish'`).get();
      const isPublished = autoPublishRow?.value === 'true' ? 1 : 0;

      db.prepare(`
        INSERT INTO published_blogs 
          (raw_news_id, title, slug, meta_description, meta_keywords, og_title, og_description,
           category, tags, content, summary, reading_time_min, is_published, published_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        news.id, blog.title, blog.slug, blog.meta_description, blog.meta_keywords,
        blog.og_title, blog.og_description, blog.category,
        JSON.stringify(blog.tags), blog.content, blog.summary,
        blog.reading_time_min, isPublished,
        isPublished ? new Date().toISOString() : null
      );

      // Mark buffer as processed
      db.prepare(`UPDATE buffer_articles SET status='processed' WHERE raw_news_id=?`).run(news.id);
      generatedCount++;
      logger.info(`Blog generated and saved: ${blog.title}`);
    }

    db.prepare(`UPDATE job_logs SET status='success', ended_at=CURRENT_TIMESTAMP, message=? WHERE id=?`)
      .run(`Generated ${generatedCount} blog posts`, logId);
  } catch (err) {
    logger.error('Generate job failed', err.message);
    db.prepare(`UPDATE job_logs SET status='failed', ended_at=CURRENT_TIMESTAMP, message=? WHERE id=?`)
      .run(err.message, logId);
  }
}

module.exports = { runGenerateJob };
