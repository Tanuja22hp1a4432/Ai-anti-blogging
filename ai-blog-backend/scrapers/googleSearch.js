const axios = require('axios');
const logger = require('../utils/logger');

/**
 * Search Google for the news title using SerpAPI.
 * Returns top 4 organic result URLs (excluding TOI itself).
 */
async function searchGoogleForNews(query) {
  try {
    logger.info(`Searching Google via SerpAPI for: "${query}"`);
    const response = await axios.get('https://serpapi.com/search', {
      params: {
        q: query,
        api_key: process.env.SERP_API_KEY,
        num: 6,
        hl: 'en',
        gl: 'in'
      },
      timeout: 10000
    });

    const results = response.data.organic_results || [];

    const filtered = results
      .filter(r => !r.link.includes('timesofindia.com'))
      .slice(0, 4)
      .map(r => ({ url: r.link, title: r.title }));

    logger.info(`Found ${filtered.length} relevant external sources`);
    return filtered;
  } catch (err) {
    logger.error('Google search failed', err.message);
    return [];
  }
}

module.exports = { searchGoogleForNews };
