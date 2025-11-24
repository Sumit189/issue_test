const logger = require('./logger');

// Send one info log every 3 seconds
const INTERVAL_MS = 3000;

let count = 0;

const sendLog = () => {
  count += 1;
  logger.info('API being used, all good', {
    sequence: count,
    timestamp: new Date().toISOString()
  });
};

// Send one immediately, then every INTERVAL_MS
sendLog();
const timer = setInterval(sendLog, INTERVAL_MS);

// Graceful shutdown
const shutdown = () => {
  clearInterval(timer);
  logger.info('Log sender shutting down', { finalCount: count });
  // Give logger a moment to flush transports
  setTimeout(() => process.exit(0), 200);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

console.log(`Log sender started — emitting 1 info log every ${INTERVAL_MS / 1000} seconds`);
