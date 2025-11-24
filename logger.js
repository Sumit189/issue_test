const winston = require('winston');
const LokiTransport = require('winston-loki');
const { format } = winston;
require('dotenv').config();

const customFormatForLoki = (opts) => {
  const { message } = opts;
  delete opts.timestamp;
  
  console.log('Loki Log:', {
    level: opts[Symbol.for('level')],
    message
  });
  
  return {
    level: opts[Symbol.for('level')],
    message,
    [Symbol.for('level')]: opts[Symbol.for('level')],
    [Symbol.for('message')]: message,
  };
};

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.json()
  ),
  defaultMeta: { service: 'node-server' },
  transports: [
    new winston.transports.Console({
      format: format.combine(
        format.colorize(),
        format.simple()
      )
    }),
    new LokiTransport({
      host: process.env.GRAFANA_HOST,
      labels: { service_name: 'issue-tester' },
      json: true,
      basicAuth: process.env.GRAFANA_BASICAUTH,
      format: format.combine(
        format.timestamp(),
        format(customFormatForLoki)()
      ),
      onConnectionError: (err) => console.error('Loki connection error:', err)
    })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: format.combine(
      format.colorize(),
      format.simple()
    )
  }));
}

module.exports = logger;

