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
    
    // Validate userId presence and type
    if (typeof userId !== 'string' || userId.trim().length === 0) {
      const error = new Error('Invalid userId: must be a non-empty string.');
      logger.error('Validation error in /process endpoint', {
        error: error.message,
        receivedData: { userId, action },
        url: req.url,
        method: req.method
      });
      return next(error);
    }
    
    // Validate action presence and type
    if (typeof action !== 'string' || action.trim().length === 0) {
      const error = new Error('Invalid action: must be a non-empty string.');
      logger.error('Validation error in /process endpoint', {
        error: error.message,
        receivedData: { userId, action },
        url: req.url,
        method: req.method
      });
      return next(error);
    }
    
    // Further specific validation for userId format could be added here if needed
    // Example: if (!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(userId)) { ... }
    
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
    
    // Validate user object and name
    if (!data.user || typeof data.user.name !== 'string' || data.user.name.trim().length === 0) {
      const error = new Error('Invalid input: user object with a non-empty name is required.');
      logger.error('Validation error in /calculate endpoint', {
        error: error.message,
        receivedData: data,
        url: req.url,
        method: req.method
      });
      return next(error);
    }
    
    // Validate items array and its contents
    if (!Array.isArray(data.items) || data.items.length === 0) {
      const error = new Error('Invalid input: items must be a non-empty array.');
      logger.error('Validation error in /calculate endpoint', {
        error: error.message,
        receivedData: data,
        url: req.url,
        method: req.method
      });
      return next(error);
    }
    
    const user = data.user;
    const items = data.items;
    
    const userName = user.name.toUpperCase();
    const totalItems = items.length;
    
    // Validate first and last items' values are numbers
    if (typeof items[0].value !== 'number' || typeof items[items.length - 1].value !== 'number') {
      const error = new Error('Invalid input: first and last item values must be numbers.');
      logger.error('Validation error in /calculate endpoint', {
        error: error.message,
        receivedData: data,
        url: req.url,
        method: req.method
      });
      return next(error);
    }
    
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
    // Catch any unexpected errors not caught by specific validation
    logger.error('Unexpected error during calculation', {
      error: err.message,
      stack: err.stack,
      url: req.url,
      method: req.method
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

