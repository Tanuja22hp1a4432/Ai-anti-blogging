-- ============================================================
-- TABLE 1: raw_news
-- Scraped headline + URL from Times of India homepage
-- ============================================================
CREATE TABLE IF NOT EXISTS raw_news (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  title        TEXT NOT NULL,
  url          TEXT NOT NULL UNIQUE,
  scraped_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
  status       TEXT DEFAULT 'pending'  -- pending | enriched | failed
);

-- ============================================================
-- TABLE 2: buffer_articles
-- Enriched content scraped from top 4 Google results
-- ============================================================
CREATE TABLE IF NOT EXISTS buffer_articles (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  raw_news_id  INTEGER NOT NULL REFERENCES raw_news(id),
  source_url   TEXT NOT NULL,
  source_title TEXT,
  content      TEXT,       -- raw scraped text content
  scraped_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
  status       TEXT DEFAULT 'pending',  -- pending | processed | failed
  UNIQUE(raw_news_id, source_url)
);

-- ============================================================
-- TABLE 3: published_blogs
-- Final LLM-generated SEO blog post
-- ============================================================
CREATE TABLE IF NOT EXISTS published_blogs (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  raw_news_id       INTEGER REFERENCES raw_news(id),
  title             TEXT NOT NULL,
  slug              TEXT UNIQUE NOT NULL,
  meta_description  TEXT,
  meta_keywords     TEXT,       -- comma-separated
  og_title          TEXT,
  og_description    TEXT,
  category          TEXT,
  tags              TEXT,       -- JSON array string: ["India","Politics"]
  content           TEXT,       -- Full markdown/HTML blog body
  summary           TEXT,       -- Short 2-3 sentence summary
  reading_time_min  INTEGER,
  is_published      INTEGER DEFAULT 0,  -- 0=draft, 1=published
  published_at      DATETIME,
  created_at        DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- TABLE 4: admin_users
-- Admin login credentials
-- ============================================================
CREATE TABLE IF NOT EXISTS admin_users (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  email        TEXT UNIQUE NOT NULL,
  password     TEXT NOT NULL,   -- bcrypt hash
  name         TEXT,
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- TABLE 5: job_logs
-- Track every cron job run
-- ============================================================
CREATE TABLE IF NOT EXISTS job_logs (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  job_name     TEXT NOT NULL,   -- scrape_toi | enrich_google | generate_blog
  status       TEXT NOT NULL,   -- success | failed | running
  message      TEXT,
  started_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
  ended_at     DATETIME,
  details      TEXT             -- JSON string with extra info
);

-- ============================================================
-- TABLE 6: settings
-- Key-value config store (editable from admin)
-- ============================================================
CREATE TABLE IF NOT EXISTS settings (
  key          TEXT PRIMARY KEY,
  value        TEXT,
  updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Default settings
INSERT OR IGNORE INTO settings (key, value) VALUES
  ('scrape_time', '08:50'),
  ('generate_time', '09:05'),
  ('auto_publish', 'false'),
  ('max_buffer_sources', '4'),
  ('blog_tone', 'professional'),
  ('blog_word_count', '800');
