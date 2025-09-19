// File Path: server/src/middleware/errorHandler.ts

import { Request, Response, NextFunction } from 'express';

// Corrected: Removed the conflicting 'name' property from this interface.
// The 'name' property is inherited from the base Error class.
interface ErrorWithStatus extends Error {
  statusCode?: number;
}

/**
 * @desc Catches all unhandled errors and sends a formatted JSON response
 */
const errorHandler = (err: ErrorWithStatus, req: Request, res: Response, next: NextFunction) => {
  // Check for Mongoose Validation Error
  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: err.message });
  }

  // Determine the status code. Default to 500 (Internal Server Error) if not set.
  const statusCode = err.statusCode || 500;

  // Log the error for debugging purposes
  console.error(`[ERROR] ${statusCode} - ${err.message}\n${err.stack}`);

  // Send a generic, user-friendly error response to the client
  res.status(statusCode).json({
    message: err.message || 'An unexpected server error occurred.',
    // In development mode, you might want to send the stack trace for easier debugging
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
  });
};

export default errorHandler;

