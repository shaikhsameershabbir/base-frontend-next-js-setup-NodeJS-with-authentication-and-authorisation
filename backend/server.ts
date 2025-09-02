

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './src/config/database';
import app, { initializeServices } from './src/app';

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        // Connect to database
        console.log('🔌 Connecting to database...');
        await connectDB();
        console.log('✅ Database connected successfully');

        // Initialize services after database connection
        console.log('🚀 Initializing services...');
        await initializeServices();
        console.log('✅ Services initialized successfully');

        // Start the server
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

startServer();

