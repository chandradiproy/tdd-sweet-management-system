// File Path: server/src/middleware/logger.ts

import { Request, Response, NextFunction } from 'express';

/**
 * @desc Logs the HTTP method, URL, and status code of each request after it has finished processing
 */
const logger = (req: Request, res: Response, next: NextFunction) => {
  
  // Listen for the 'finish' event on the response object
  // This event is fired when the response has been sent
  res.on('finish', () => {
    // We can now access the final status code of the response
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode}`);
  });
  
  // Pass control to the next middleware in the stack
  next();
};

export default logger;

