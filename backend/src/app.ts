import express from 'express';
import helmet from 'helmet';
import mongoose from 'mongoose';

import apiRoutes from './api/v1/routes';
import { ErrorHandlerMiddleware } from './api/v1/middlewares/errorHandler.middleware';
import { RateLimiterMiddleware } from './api/v1/middlewares/rateLimiter.middleware';
import { ValidationMiddleware } from './api/v1/middlewares/validation.middleware';
import { logger } from './config/logger';
import { autoResultService } from './services/autoResultService';

const app = express();
const errorHandler = new ErrorHandlerMiddleware();
const rateLimiter = new RateLimiterMiddleware();
const validationMiddleware = new ValidationMiddleware();

// Endpoint hit counter
interface EndpointStats {
    count: number;
    lastHit: Date;
    methods: Set<string>;
}

const endpointHits = new Map<string, EndpointStats>();

// Middleware to count endpoint hits
const countEndpointHits = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const endpoint = req.path;
    const method = req.method;

    if (!endpointHits.has(endpoint)) {
        endpointHits.set(endpoint, {
            count: 0,
            lastHit: new Date(),
            methods: new Set()
        });
    }

    const stats = endpointHits.get(endpoint)!;
    stats.count++;
    stats.lastHit = new Date();
    stats.methods.add(method);

    // Real-time logging of endpoint hits
    // const timestamp = new Date().toISOString();

    next();
};

// Function to get endpoint statistics
export const getEndpointStats = () => {
    const stats: Record<string, {
        count: number;

        lastHit: string;
        methods: string[];
        averageHitsPerMinute: number;
    }> = {};

    endpointHits.forEach((value, key) => {
        stats[key] = {
            count: value.count,
            lastHit: value.lastHit.toISOString(),
            methods: Array.from(value.methods),
            averageHitsPerMinute: calculateAverageHitsPerMinute(value)
        };
    });

    return stats;
};

// Function to calculate average hits per minute (simple calculation)
const calculateAverageHitsPerMinute = (stats: EndpointStats) => {
    const now = new Date();
    const timeDiffInMinutes = (now.getTime() - stats.lastHit.getTime()) / (1000 * 60);
    return timeDiffInMinutes > 0 ? stats.count / timeDiffInMinutes : stats.count;
};

// Database connection is handled in server.ts

// Initialize services after database connection
export const initializeServices = async (): Promise<void> => {
    try {
        logger.info('Initializing services...Using new code for auto result service');
        // Initialize cron service
        logger.info('Initializing cron service...');
        try {
            // The cron service will be initialized automatically when imported
            logger.info('Cron service initialized successfully');
        } catch (error) {
            logger.error('Failed to initialize cron service:', error);
        }

        // Initialize auto result service
        logger.info('Initializing auto result service...');
        try {
            await autoResultService.initializeAutoResultMarkets();
            logger.info('Auto result service initialized successfully');
        } catch (error) {
            logger.error('Failed to initialize auto result service:', error);
        }
    } catch (error) {
        logger.error('Failed to initialize services:', error);
        throw error;
    }
};

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

// Global rate limiting
app.use(rateLimiter.apiLimiter);

// Body parsing middleware with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Input sanitization
app.use(validationMiddleware.sanitizeInput);

// Handle OPTIONS requests first (preflight requests)
app.options('*', (req, res) => {
    const origin = req.headers.origin;

    // logger.info(`OPTIONS request from origin: ${origin}, path: ${req.path}`);

    if (origin) {
        res.header('Access-Control-Allow-Origin', origin);
    } else {
        res.header('Access-Control-Allow-Origin', '*');
    }

    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, X-File-Name, Pragma, Expires, ETag, Last-Modified, Surrogate-Control, Vary, CDN-Cache-Control, Cloudflare-CDN-Cache-Control');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Expose-Headers', 'Set-Cookie, Content-Length, X-Foo, X-Bar');


    res.status(200).end();
});

// Comprehensive CORS middleware - Handle all CORS requirements
app.use((req, res, next) => {
    // Get the origin from the request
    const origin = req.headers.origin;

    // Set CORS headers for all responses
    if (origin) {
        res.header('Access-Control-Allow-Origin', origin);
    } else {
        res.header('Access-Control-Allow-Origin', '*');
    }

    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, X-File-Name, Pragma, Expires, ETag, Last-Modified, Surrogate-Control, Vary, CDN-Cache-Control, Cloudflare-CDN-Cache-Control');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Expose-Headers', 'Set-Cookie, Content-Length, X-Foo, X-Bar');

    next();
});

// Enhanced logging middleware
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    const method = req.method;
    const endpoint = req.path;
    const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;

    // Create request log object

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const requestLog: Record<string, any> = {
        timestamp,
        method,
        endpoint,
        fullUrl,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
    };

    // Add query parameters if any
    if (Object.keys(req.query).length > 0) {
        requestLog.query = req.query;
    }

    // Add route parameters if any
    if (Object.keys(req.params).length > 0) {
        requestLog.params = req.params;
    }

    // Add request body for POST/PUT/PATCH requests (but exclude sensitive data)
    if (['POST', 'PUT', 'PATCH'].includes(method) && req.body) {
        const sanitizedBody = { ...req.body };
        // Remove sensitive fields from logging
        delete sanitizedBody.password;
        delete sanitizedBody.newPassword;
        delete sanitizedBody.token;
        delete sanitizedBody.accessToken;
        delete sanitizedBody.refreshToken;

        if (Object.keys(sanitizedBody).length > 0) {
            requestLog.body = sanitizedBody;
        }
    }

    // Add headers (but exclude sensitive ones)
    const headers = { ...req.headers };
    delete headers.authorization;
    delete headers.cookie;
    delete headers['x-api-key'];
    requestLog.headers = headers;

    // Log the complete request (production logging handled by logger)
    // console.log(`[${timestamp}] ${method} ${endpoint}`);
    // console.log('Request Details:', requestLog.query);

    next();
});

// Health check endpoint
app.get('/health', (req, res) => {
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';

    res.json({
        status: dbStatus === 'connected' ? 'OK' : 'WARNING',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        version: '1.0.0',
        database: {
            status: dbStatus,
            readyState: mongoose.connection.readyState
        }
    });
});



// Endpoint statistics endpoint
app.get('/api-stats', (req, res) => {
    const stats = getEndpointStats();
    const totalHits = Object.values(stats).reduce((sum, stat) => sum + stat.count, 0);

    res.json({
        totalEndpoints: Object.keys(stats).length,
        totalHits,
        endpoints: stats,
        timestamp: new Date().toISOString()
    });
});

const API_PREFIX = '/api/v1';

// Apply endpoint hit counting middleware to API routes
app.use(API_PREFIX, countEndpointHits, apiRoutes);

// 404 handler
app.use(errorHandler.handleNotFound);

// Global error handler
app.use(errorHandler.handleError);

export default app;