import { Request, Response, NextFunction } from 'express';
import { logger } from '../../../config/logger';

export class ErrorHandlerMiddleware {
    handleError(err: any, req: Request, res: Response, next: NextFunction): void {
        logger.error('Unhandled error:', {
            error: err.message,
            stack: err.stack,
            path: req.path,
            method: req.method,
            ip: req.ip,
            userAgent: req.get('User-Agent')
        });

        // Handle different types of errors
        if (err.name === 'ValidationError') {
            res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: err.errors
            });
            return;
        }

        if (err.name === 'CastError') {
            res.status(400).json({
                success: false,
                message: 'Invalid ID format'
            });
            return;
        }

        if (err.code === 11000) {
            res.status(409).json({
                success: false,
                message: 'Duplicate entry found'
            });
            return;
        }

        // Default error response
        res.status(err.status || 500).json({
            success: false,
            message: process.env.NODE_ENV === 'production'
                ? 'Internal server error'
                : err.message
        });
    }

    handleNotFound(req: Request, res: Response, next: NextFunction): void {
        res.status(404).json({
            success: false,
            message: 'Route not found'
        });
    }
} 