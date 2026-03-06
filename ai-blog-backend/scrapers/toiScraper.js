const puppeteer = require('puppeteer');
const logger = require('../utils/logger');

/**
 * Scrapes the Times of India homepage.
 * Targets the main news section and returns up to the specified limit of news items.
 * Returns: Array of { title, url }
 */
async function scrapeTopTOINews(limit = 5) {
  let browser;
  try {
    logger.info(`Starting TOI Scraper for up to ${limit} items...`);
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
    await page.waitForSelector('.BxDma a, .col_l_6 a', { timeout: 15000 });

    const newsItems = await page.evaluate((maxItems) => {
      const results = [];
      const seenUrls = new Set();
      const selectors = ['.BxDma a', '.col_l_6 a', '.top-newslist a', '.news-card a'];
      
      for (const selector of selectors) {
        if (results.length >= maxItems) break;
        
        const links = Array.from(document.querySelectorAll(selector));
        for (const link of links) {
          if (results.length >= maxItems) break;
          
          if (link && link.innerText.trim().length > 10) {
            const url = link.href;
            if (!seenUrls.has(url)) {
              seenUrls.add(url);
              const titleEl = link.querySelector('.CRKrj') || link;
              results.push({
                title: titleEl.innerText.trim(),
                url: url
              });
            }
          }
        }
      }
      return results;
    }, limit);

    if (!newsItems || newsItems.length === 0) {
      throw new Error('Could not find any news items on TOI homepage');
    }

    logger.info(`Successfully scraped ${newsItems.length} news items from TOI`);
    return newsItems;

  } catch (err) {
    logger.error('TOI Scrape failed', err.message);
    return [];
  } finally {
    if (browser) await browser.close();
  }
}

module.exports = { scrapeTopTOINews };
