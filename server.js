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
    
    if (!userId || !action) {
      const error = new Error('Missing required fields: userId and action are required');
      logger.error('Validation error in /process endpoint', {
        error: error.message,
        receivedData: { userId, action },
        url: req.url,
        method: req.method
      });
      return next(error);
    }
    
    if (typeof userId !== 'string' || userId.trim().length === 0) {
      const error = new Error('Invalid userId: must be a non-empty string');
      logger.error('Validation error in /process endpoint', {
        error: error.message,
        receivedData: { userId, action },
        url: req.url,
        method: req.method
      });
      return next(error);
    }
    
    logger.info('Processing request', { userId, action });
    res.json({ message: 'Processing completed', userId, action });
  } catch (err) {
    logger.error('Unexpected error in /process endpoint', {
      error: err.message,
      stack: err.stack,
      url: req.url,
      method: req.method
    });
    next(err);
  }
});

app.post('/calculate', (req, res, next) => {
  try {
    const { user, items } = req.body;

    logger.info('Calculate endpoint called', { receivedData: req.body });

    // Input validation
    if (!user || typeof user !== 'object' || typeof user.name !== 'string' || user.name.trim().length === 0) {
      const error = new Error('Invalid or missing user data. Expected an object with a non-empty name property.');
      logger.error('Validation error in /calculate endpoint', { error: error.message, receivedData: req.body });
      return res.status(400).json({ error: 'Bad Request', message: error.message });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      const error = new Error('Invalid or missing items data. Expected a non-empty array.');
      logger.error('Validation error in /calculate endpoint', { error: error.message, receivedData: req.body });
      return res.status(400).json({ error: 'Bad Request', message: error.message });
    }

    // Process data now that it is validated
    const userName = user.name.toUpperCase();
    const totalItems = items.length;
    const firstItem = items[0].value;
    const lastItem = items[items.length - 1].value;

    const result = {
      userName,
      totalItems,
      firstItem,
      lastItem,
      sum: firstItem + lastItem
    };

    res.json({ message: 'Calculation completed', result });
  } catch (err) {
    // This will now catch unexpected errors, e.g., if item.value is missing
    logger.error('Error during calculation', {
      error: err.message,
      stack: err.stack
    });
    next(err);
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

