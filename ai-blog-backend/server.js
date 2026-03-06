const app = require('./app');
const logger = require('./utils/logger');
const { startScheduler } = require('./jobs/scheduler');

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
  startScheduler();
});
