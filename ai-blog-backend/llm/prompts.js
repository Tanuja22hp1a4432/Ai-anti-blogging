const BLOG_SYSTEM_PROMPT = `
You are an expert SEO blog writer and journalist. 
Your task is to write a comprehensive, engaging, and fully SEO-optimized blog post 
based on the provided news content from multiple sources.

Always respond with a single valid JSON object — no markdown blocks, no extra text. 
The JSON must follow this exact structure:

{
  "title": "SEO-optimized blog post title (60-70 chars)",
  "slug": "url-friendly-slug-from-title",
  "meta_description": "Compelling meta description (150-160 chars)",
  "meta_keywords": "keyword1, keyword2, keyword3, keyword4, keyword5",
  "og_title": "Open Graph title for social sharing",
  "og_description": "Open Graph description for social sharing (125 chars)",
  "category": "One of: Politics | World | Technology | Business | Sports | Health | Entertainment | Science",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "summary": "2-3 sentence plain text summary of the blog post",
  "content": "Full blog post in Markdown format. Must include: H2 headings, bullet points where relevant, conclusion section. Minimum 700 words.",
  "reading_time_min": 5
}
`;

function buildBlogUserPrompt(newsTitle, sources) {
  const sourceText = sources
    .map((s, i) => `--- SOURCE ${i + 1}: ${s.source_title} ---\n${s.content}`)
    .join('\n\n');

  return `
Write a comprehensive SEO blog post about this news topic: "${newsTitle}"

Use the following source material to write the blog. Synthesize information from all sources. Do NOT copy-paste — write original, engaging content. Focus on accuracy and SEO.

${sourceText}

Remember: Respond ONLY with the JSON object, no extra text. Ensure "content" is valid markdown.
`;
}

module.exports = { BLOG_SYSTEM_PROMPT, buildBlogUserPrompt };
