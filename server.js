app.post('/calculate', (req, res, next) => {
  try {
    const data = req.body;
    logger.info('Calculate endpoint called', { receivedData: data });

    // Validate the structure of the incoming data
    if (!data || !data.user || typeof data.user.name !== 'string' || !Array.isArray(data.items) || data.items.length === 0) {
      const errorMsg = 'Invalid request body: must include a user object with a name and a non-empty items array.';
      logger.error('Validation error in /calculate', { error: errorMsg, body: req.body });
      return res.status(400).json({ error: 'Bad Request', message: errorMsg });
    }

    const items = data.items;
    const firstItem = items[0];
    const lastItem = items[items.length - 1];

    // Validate nested properties
    if (firstItem.value === undefined || lastItem.value === undefined) {
      const errorMsg = 'Invalid request body: first and last items in the array must have a `value` property.';
      logger.error('Validation error in /calculate', { error: errorMsg, body: req.body });
      return res.status(400).json({ error: 'Bad Request', message: errorMsg });
    }
    
    const result = {
      userName: data.user.name.toUpperCase(),
      totalItems: items.length,
      firstItem: firstItem.value,
      lastItem: lastItem.value,
      sum: firstItem.value + lastItem.value
    };
    
    res.json({ message: 'Calculation completed', result });
  } catch (err) {
    // This catch block will now only handle truly unexpected errors, not validation failures.
    logger.error('Unexpected error in /calculate endpoint', {
      error: err.message,
      stack: err.stack,
      url: req.url,
      method: req.method
    });
    next(err);
  }
});