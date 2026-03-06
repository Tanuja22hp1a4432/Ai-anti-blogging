const OpenAI = require('openai');
const logger = require('../utils/logger');

// Groq uses OpenAI-compatible API
const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
});

/**
 * Calls Groq API to generate blog content.
 */
async function generateWithGroq(systemPrompt, userPrompt) {
  try {
    logger.info('Calling Groq LLM for blog generation...');
    const response = await client.chat.completions.create({
      model: 'groq/compound-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 3000,
    });

    const content = response.choices[0].message.content;
    logger.info('LLM response received successfully');
    return content;
  } catch (err) {
    logger.error('Groq LLM call failed', err.message);
    throw err;
  }
}

module.exports = { generateWithGroq };
