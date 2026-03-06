const puppeteer = require('puppeteer');
const logger = require('../utils/logger');

/**
 * Scrapes the Times of India homepage.
 * Targets the main news section and returns the FIRST news item.
 * Returns: { title, url }
 */
async function scrapeFirstTOINews() {
  let browser;
  try {
    logger.info('Starting TOI Scraper...');
    browser = await puppeteer.launch({ 
      headless: 'new', 
      args: ['--no-sandbox', '--disable-setuid-sandbox'] 
    });
    const page = await browser.newPage();
    
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36');
    await page.setExtraHTTPHeaders({ 'Accept-Language': 'en-US,en;q=0.9' });

    await page.goto('https://timesofindia.indiatimes.com/', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });

    // Wait for the main news container
    // Based on the plan's selector and TOI's common structure
    await page.waitForSelector('.BxDma a, .col_l_6 a', { timeout: 15000 });

    const newsItem = await page.evaluate(() => {
      // Try multiple potential selectors for the lead story
      const selectors = ['.BxDma a.VeCXM', '.col_l_6 a', '.top-newslist a', '.news-card a'];
      
      for (const selector of selectors) {
        const link = document.querySelector(selector);
        if (link && link.innerText.trim().length > 10) {
          const titleEl = link.querySelector('.CRKrj') || link;
          return {
            title: titleEl.innerText.trim(),
            url: link.href
          };
        }
      }
      return null;
    });

    if (!newsItem) {
      throw new Error('Could not find any news item on TOI homepage');
    }

    logger.info(`Successfully scraped TOI: ${newsItem.title}`);
    return newsItem;

  } catch (err) {
    logger.error('TOI Scrape failed', err.message);
    return null;
  } finally {
    if (browser) await browser.close();
  }
}

module.exports = { scrapeFirstTOINews };
