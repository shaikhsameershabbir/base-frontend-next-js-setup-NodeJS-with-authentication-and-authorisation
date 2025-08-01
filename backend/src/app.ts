import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { connectDB } from './config/database';

import apiRoutes from './api/v1/routes';
import { ErrorHandlerMiddleware } from './api/v1/middlewares/errorHandler.middleware';
import { RateLimiterMiddleware } from './api/v1/middlewares/rateLimiter.middleware';
import { ValidationMiddleware } from './api/v1/middlewares/validation.middleware';

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
    // console.log(`[${timestamp}] ${method} ${endpoint} }`);
    // console.log(`[${timestamp}] ${method} ${endpoint} - Total hits: ${stats.count}`);

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

// Logging middleware
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    const method = req.method;
    const endpoint = req.path;
    console.log(`[${timestamp}] ${method} ${endpoint}`);
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