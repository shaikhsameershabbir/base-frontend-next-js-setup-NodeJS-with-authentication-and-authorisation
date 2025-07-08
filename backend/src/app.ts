import express from 'express';
import { errorHandler } from './middlewares/globalErrorHandler';
import { connectDB } from './config/database';
import authRoutes from './routes/authRoutes';
import { logger } from './config/logger';

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.path}`);
    next();
});

// Routes
app.get('/', async (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Matka SK API Server',
        version: '1.0.0'
    });
});

// API Routes
app.use('/api/auth', authRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is healthy',
        timestamp: new Date().toISOString()
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Global error handler
app.use(errorHandler);

export default app;