const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const logger = require('../utils/logger');

/**
 * Scrapes article text content from a given URL.
 * Strips nav, header, footer, ads. Returns plain text.
 */
async function scrapeArticleContent(url) {
  let browser;
  try {
    logger.info(`Scraping content from: ${url}`);
    browser = await puppeteer.launch({ 
      headless: 'new', 
      args: ['--no-sandbox', '--disable-setuid-sandbox'] 
    });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36');
    
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    const html = await page.content();
    
    // Parse with Cheerio
    const $ = cheerio.load(html);
    
    // Remove noise elements
    $('nav, header, footer, script, style, iframe, .ad, .advertisement, [class*="ad-"], aside, noscript').remove();

    // Extract article paragraphs
    const paragraphs = [];
    $('article p, .article-body p, .story-body p, main p, [class*="content"] p, .post-content p').each((_, el) => {
      const text = $(el).text().trim();
      // Only keep paragraphs that look like real content (not short buttons/metadata)
      if (text.length > 60) paragraphs.push(text);
    });

    // Fallback: all body paragraphs if no specific container found
    if (paragraphs.length < 3) {
      $('body p').each((_, el) => {
        const text = $(el).text().trim();
        if (text.length > 80) paragraphs.push(text);
      });
    }

    const content = paragraphs.slice(0, 30).join('\n\n');
    logger.info(`Successfully scraped ${paragraphs.length} paragraphs from ${url}`);
    return content.length > 100 ? content : null;

  } catch (err) {
    logger.error(`Content scrape failed for ${url}`, err.message);
    return null;
  } finally {
    if (browser) await browser.close();
  }
}

module.exports = { scrapeArticleContent };
