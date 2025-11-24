const logger = require('./logger');


let count = 0;
let timer = null;
let shuttingDown = false;

function getRandomDelayMs() {
  return Math.floor(Math.random() * 30_000) + 1_000;
}

const sendLog = () => {
  if (shuttingDown) return;
  count += 1;
  logger.info('API being used, all good', {
    sequence: count,
    timestamp: new Date().toISOString()
  });
  timer = setTimeout(sendLog, getRandomDelayMs());
};

sendLog();

const shutdown = () => {
  shuttingDown = true;
  if (timer) clearTimeout(timer);
  logger.info('Log sender shutting down', { finalCount: count });
  setTimeout(() => process.exit(0), 200);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

console.log('Log sender started — emitting 1 info log after random seconds between 1 and 30');
