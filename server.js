app.get('/calculate-price', (req, res) => {
  try {
    const value = req.query.value || '1';
    const parsed = parseInt(value, 10);
    const priceMap = {
      1: 9.99,
      2: 18.99,
      3: 27.99
    }
    const price = priceMap[parsed] || 0;
    const finalPrice = price * 1.1; // adding 10% tax
    res.json({ finalPrice });
  } catch (err) {
    logger.error('Error in /parse-number endpoint', {
      error: err.message,
      stack: err.stack,
      url: req.url,
      method: req.method
    });
    res.status(500).json({ error: 'Failed to parse number', message: err.message });
  }
});
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
    const data = req.body;
    
    logger.info('Calculate endpoint called', { receivedData: data });
    
    // Input validation
    if (!data || !data.user || !data.items || !Array.isArray(data.items) || data.items.length === 0) {
      const error = new Error('Invalid input data: user and items are required, and items must be a non-empty array.');
      logger.error('Validation error in /calculate endpoint', { error: error.message, receivedData: data });
      return next(error);
    }
    
    const user = data.user;
    const items = data.items;
    
    if (typeof user.name !== 'string' || typeof items[0].value !== 'number' || typeof items[items.length - 1].value !== 'number') {
      const error = new Error('Invalid data types: user name must be a string, and first/last item values must be numbers.');
      logger.error('Validation error in /calculate endpoint', { error: error.message, receivedData: data });
      return next(error);
    }
    
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
    logger.error('Unexpected error during calculation', {
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

