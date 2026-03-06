const OpenAI = require('openai');
const logger = require('../utils/logger');

// Groq uses OpenAI-compatible API
const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
});

/**
 * Helper to pause execution
 */
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Calls Groq API to generate blog content with exponential backoff and fallbacks.
 */
async function generateWithGroq(systemPrompt, userPrompt) {
  // Use faster, higher-rate-limit models for primary generation
  const models = ['llama-3.1-8b-instant', 'mixtral-8x7b-32768'];
  const maxRetries = 2; // Reduced from 3 to prevent taking too much time
  const baseDelay = 1000;

  for (const model of models) {
    logger.info(`Attempting Groq LLM generation with model: ${model}`);
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await client.chat.completions.create({
          model: model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.7,
          max_tokens: 3000,
        });

        const content = response.choices[0].message.content;
        logger.info(`LLM response received successfully on attempt ${attempt} using ${model}`);
        return content;

      } catch (err) {
        const isRateLimit = err.status === 429 || (err.error && err.error.message && err.error.message.includes('Rate limit'));
        
        if (isRateLimit && attempt < maxRetries) {
          // Parse potential wait time from Groq's error message (e.g. "Please try again in 7.6s.")
          let waitTime = baseDelay * attempt;
          const match = err.error?.message?.match(/try again in ([0-9.]+)s/);
          if (match && match[1]) {
             waitTime = Math.ceil(parseFloat(match[1]) * 1000); 
          }
          
          logger.warn(`Rate limit hit on attempt ${attempt} for model ${model}. Waiting ${waitTime}ms...`);
          await delay(waitTime);
        } else if (attempt === maxRetries) {
          logger.error(`Failed with model ${model} after ${maxRetries} attempts.`);
          break; // Move to the fallback model in the outer loop
        } else {
          logger.error(`Groq LLM call failed with unexpected error on attempt ${attempt}`, err.message);
          throw err; // Stop if it's a critical error
        }
      }
    }
  }

  throw new Error('All Groq LLM models failed due to rate limits or errors. Please check your Groq Dashboard usage.');
}

module.exports = { generateWithGroq };
