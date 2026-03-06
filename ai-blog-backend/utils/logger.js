const logger = {
  info: (msg, details = '') => {
    console.log(`[INFO] [${new Date().toISOString()}] ${msg}`, details);
  },
  error: (msg, err = '') => {
    console.error(`[ERROR] [${new Date().toISOString()}] ${msg}`, err);
  },
  warn: (msg, details = '') => {
    console.warn(`[WARN] [${new Date().toISOString()}] ${msg}`, details);
  }
};

module.exports = logger;
