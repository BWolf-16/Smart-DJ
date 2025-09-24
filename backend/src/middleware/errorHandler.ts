import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { SmartDJError } from '@smart-dj/shared';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error('Error Handler:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Handle SmartDJ custom errors
  if (error instanceof SmartDJError) {
    return res.status(error.statusCode).json({
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details
      }
    });
  }

  // Handle Mongoose validation errors
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: error.message
      }
    });
  }

  // Handle Mongoose cast errors
  if (error.name === 'CastError') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_ID',
        message: 'Invalid ID format',
        details: error.message
      }
    });
  }

  // Handle JWT errors
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Invalid token',
        details: error.message
      }
    });
  }

  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: {
        code: 'TOKEN_EXPIRED',
        message: 'Token has expired',
        details: error.message
      }
    });
  }

  // Handle duplicate key errors
  if (error.name === 'MongoServerError' && (error as any).code === 11000) {
    return res.status(409).json({
      success: false,
      error: {
        code: 'DUPLICATE_ENTRY',
        message: 'Resource already exists',
        details: 'A record with this information already exists'
      }
    });
  }

  // Handle rate limiting errors
  if (error.message && error.message.includes('Too many requests')) {
    return res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests',
        details: 'Please try again later'
      }
    });
  }

  // Default server error
  const statusCode = process.env.NODE_ENV === 'production' ? 500 : 500;
  const message = process.env.NODE_ENV === 'production' 
    ? 'Something went wrong!' 
    : error.message;

  res.status(statusCode).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message,
      ...(process.env.NODE_ENV !== 'production' && { stack: error.stack })
    }
  });
};