const express = require('express');
const logger = require('./logger');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  logger.info('Incoming request', {
    method: req.method,
    url: req.url,
    ip: req.ip
  });
  next();
});

app.get('/', (req, res) => {
  logger.info('Root endpoint accessed');
  res.json({ message: 'Server is running', timestamp: new Date().toISOString() });
});

app.get('/health', (req, res) => {
  logger.info('Health check endpoint accessed');
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.post('/log', (req, res) => {
  logger.info('Log endpoint called', { body: req.body });
  res.json({ message: 'Log received', data: req.body });
});

app.post('/process', (req, res, next) => {
  try {
    const { userId, action } = req.body;
    
    // Enhanced validation for userId and action
    if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
      const error = new Error('Invalid userId: must be a non-empty string.');
      logger.error('Validation error in /process endpoint', {
        error: error.message,
        receivedData: { userId, action },
        url: req.url,
        method: req.method
      });
      return res.status(400).json({ error: error.message });
    }

    if (!action || typeof action !== 'string' || action.trim().length === 0) {
      const error = new Error('Invalid action: must be a non-empty string.');
      logger.error('Validation error in /process endpoint', {
        error: error.message,
        receivedData: { userId, action },
        url: req.url,
        method: req.method
      });
      return res.status(400).json({ error: error.message });
    }

    // Basic sanitization for userId (example: remove leading/trailing whitespace)
    const sanitizedUserId = userId.trim();

    logger.info('Processing request', { userId: sanitizedUserId, action });
    res.json({ message: 'Processing completed', userId: sanitizedUserId, action });
  } catch (err) {
    logger.error('Unexpected error in /process endpoint', {
      error: err.message,
      stack: err.stack,
      url: req.url,
      method: req.method
    });
    res.status(500).json({ error: 'Internal server error', message: err.message });
  }
});

app.post('/calculate', (req, res, next) => {
  try {
    const data = req.body;
    
    logger.info('Calculate endpoint called', { receivedData: data });

    // Validate user object and its properties
    if (!data.user || typeof data.user.name !== 'string' || data.user.name.trim().length === 0) {
      const error = new Error('Invalid user data: user.name is required and must be a non-empty string.');
      logger.error('Invalid data in /calculate endpoint', {
        error: error.message,
        receivedData: data
      });
      return res.status(400).json({ error: error.message });
    }

    // Validate items array and its properties
    if (!Array.isArray(data.items) || data.items.length === 0) {
      const error = new Error('Invalid items data: items must be a non-empty array.');
      logger.error('Invalid data in /calculate endpoint', {
        error: error.message,
        receivedData: data
      });
      return res.status(400).json({ error: error.message });
    }

    const userName = data.user.name.toUpperCase();
    const totalItems = data.items.length;
    // Ensure first and last items have a 'value' property that is a number
    if (typeof data.items[0].value !== 'number' || typeof data.items[totalItems - 1].value !== 'number') {
      const error = new Error('Invalid item value: first and last items must have a numeric value.');
      logger.error('Invalid data in /calculate endpoint', {
        error: error.message,
        receivedData: data
      });
      return res.status(400).json({ error: error.message });
    }

    const firstItemValue = data.items[0].value;
    const lastItemValue = data.items[totalItems - 1].value;

    const result = {
      userName,
      totalItems,
      firstItem: firstItemValue,
      lastItem: lastItemValue,
      sum: firstItemValue + lastItemValue
    };
    
    res.json({ message: 'Calculation completed', result });
  } catch (err) {
    logger.error('Unexpected error in /calculate endpoint', {
      error: err.message,
      stack: err.stack,
      url: req.url,
      method: req.method
    });
    res.status(500).json({ error: 'Internal server error', message: err.message });
  }
});

app.get('/error', (req, res, next) => {
  logger.error('Error endpoint accessed - generating test error');
  const error = new Error('Test error for logging');
  next(error);
});

app.use((err, req, res, next) => {
  logger.error('Error occurred', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method
  });
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

app.listen(PORT, () => {
  logger.info(`Server started on port ${PORT}`);
  console.log(`Server is running on http://localhost:${PORT}`);
});
