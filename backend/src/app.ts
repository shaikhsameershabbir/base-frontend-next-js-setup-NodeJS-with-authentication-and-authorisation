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

// CORS configuration - Allow all origins
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        // Allow all origins
        return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Origin', 'Accept', 'Cache-Control', 'X-File-Name'],
    exposedHeaders: ['Set-Cookie', 'Content-Length', 'X-Foo', 'X-Bar'],
    preflightContinue: false,
    optionsSuccessStatus: 204
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

// Additional CORS headers for all responses
app.use((req, res, next) => {
    // Set the origin header to the requesting origin or * if no origin
    const origin = req.headers.origin || '*';
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, X-File-Name');
    res.header('Access-Control-Allow-Credentials', 'true');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

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

// CORS test endpoint
app.get('/cors-test', (req, res) => {
    res.json({
        message: 'CORS is working!',
        origin: req.headers.origin,
        method: req.method,
        timestamp: new Date().toISOString()
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