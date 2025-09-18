// File Path: server/src/middleware/logger.ts

import pinoHttp from 'pino-http';
import { IncomingMessage, ServerResponse } from 'http';

const logger = pinoHttp({
  // Use pino-pretty for development
  transport: process.env.NODE_ENV !== 'production' ? {
    target: 'pino-pretty',
    options: {
      colorize: true,
      levelFirst: true,
      translateTime: 'SYS:h:MM:ss TT', // More readable time format
      ignore: 'pid,hostname', // Ignore noisy fields
    },
  } : undefined,
  level: 'info',
  customLogLevel: function (req: IncomingMessage, res: ServerResponse, err?: Error): string {
    if (res.statusCode >= 400 && res.statusCode < 500) {
      return 'warn';
    } else if (res.statusCode >= 500 || err) {
      return 'error';
    }
    return 'info';
  },
});

export default logger;

