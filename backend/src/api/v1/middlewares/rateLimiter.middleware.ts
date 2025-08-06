import rateLimit from 'express-rate-limit';
import { logger } from '../../../config/logger';

export class RateLimiterMiddleware {
    loginLimiter = rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 50, // limit each IP to 5 login attempts per windowMs
        message: {
            success: false,
            message: 'Too many login attempts, please try again later'
        },
        standardHeaders: true,
        legacyHeaders: false,
        handler: (req, res) => {
            logger.warn(`Rate limit exceeded for login attempt from IP: ${req.ip}`);
            res.status(429).json({
                success: false,
                message: 'Too many login attempts, please try again later'
            });
        }
    });

    apiLimiter = rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 10000, // limit each IP to 100 requests per windowMs
        message: {
            success: false,
            message: 'Too many requests from this IP, please try again later'
        },
        standardHeaders: true,
        legacyHeaders: false,
        handler: (req, res) => {
            logger.warn(`Rate limit exceeded for API request from IP: ${req.ip}`);
            res.status(429).json({
                success: false,
                message: 'Too many requests from this IP, please try again later'
            });
        }
    });

    transferLimiter = rateLimit({
        windowMs: 60 * 1000, // 1 minute
        max: 10, // limit each IP to 10 transfer requests per minute
        message: {
            success: false,
            message: 'Too many transfer requests, please try again later'
        },
        standardHeaders: true,
        legacyHeaders: false,
        handler: (req, res) => {
            logger.warn(`Rate limit exceeded for transfer request from IP: ${req.ip}`);
            res.status(429).json({
                success: false,
                message: 'Too many transfer requests, please try again later'
            });
        }
    });
} 