import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { connectDB } from './config/database';
import { logger } from './config/logger';
import apiRoutes from './api/v1/routes';
import { ErrorHandlerMiddleware } from './api/v1/middlewares/errorHandler.middleware';
import { RateLimiterMiddleware } from './api/v1/middlewares/rateLimiter.middleware';
import { ValidationMiddleware } from './api/v1/middlewares/validation.middleware';

const app = express();
const errorHandler = new ErrorHandlerMiddleware();
const rateLimiter = new RateLimiterMiddleware();
const validationMiddleware = new ValidationMiddleware();

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
    crossOriginEmbedderPolicy: false,
}));

// CORS configuration
app.use(cors({
    origin: ['http://localhost:3001', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Set-Cookie']
}));

// Handle preflight requests explicitly
app.options('*', cors());

// Global rate limiting
app.use(rateLimiter.apiLimiter);

// Body parsing middleware with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Input sanitization
app.use(validationMiddleware.sanitizeInput);

// Request logging
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.path}`, {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
    });
    next();
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        version: '1.0.0'
    });
});
const API_PREFIX = '/api/v1';
// API routes
app.use(API_PREFIX, apiRoutes);

// 404 handler
app.use(errorHandler.handleNotFound);

// Global error handler
app.use(errorHandler.handleError);

export default app;