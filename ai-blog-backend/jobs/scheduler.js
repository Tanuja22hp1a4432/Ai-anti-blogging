const cron = require('node-cron');
const { runScrapeJob } = require('./scrapeJob');
const { runEnrichJob } = require('./enrichJob');
const { runGenerateJob } = require('./generateJob');
const logger = require('../utils/logger');
const db = require('../database/db');

function startScheduler() {
  logger.info('Initializing Scheduler...');

  // Get cron times from settings or use defaults
  const settings = db.prepare('SELECT * FROM settings').all();
  const getSetting = (key, def) => settings.find(s => s.key === key)?.value || def;

  const scrapeTime = getSetting('scrape_time', '08:50');
  const generateTime = getSetting('generate_time', '09:05');

  // Scrape TOI at specified time
  // Format: "50 8 * * *"
  const [hour, minute] = scrapeTime.split(':');
  cron.schedule(`${minute} ${hour} * * *`, async () => {
    logger.info('[CRON] Running TOI Scrape Job');
    await runScrapeJob();
  });

  // Enrich 10 mins after scrape (hardcoded 9:00 for simplicity or based on logic)
  cron.schedule('0 9 * * *', async () => {
    logger.info('[CRON] Running Google Enrichment Job');
    await runEnrichJob();
  });

  // Generate at specified time
  const [gHour, gMinute] = generateTime.split(':');
  cron.schedule(`${gMinute} ${gHour} * * *`, async () => {
    logger.info('[CRON] Running LLM Blog Generation Job');
    await runGenerateJob();
  });

  logger.info(`✅ Scheduler started. Scrape: ${scrapeTime}, Enrich: 09:00, Generate: ${generateTime}`);
}

module.exports = { startScheduler };
