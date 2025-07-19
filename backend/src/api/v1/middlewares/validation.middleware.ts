import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { logger } from '../../../config/logger';

export class ValidationMiddleware {
    validateRequest(req: Request, res: Response, next: NextFunction): void {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            logger.warn('Validation error:', {
                path: req.path,
                method: req.method,
                errors: errors.array()
            });

            res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
            return;
        }

        next();
    }

    sanitizeInput(req: Request, res: Response, next: NextFunction): void {
        // Basic input sanitization
        if (req.body) {
            Object.keys(req.body).forEach(key => {
                if (typeof req.body[key] === 'string') {
                    req.body[key] = req.body[key].trim();
                }
            });
        }

        next();
    }
} 