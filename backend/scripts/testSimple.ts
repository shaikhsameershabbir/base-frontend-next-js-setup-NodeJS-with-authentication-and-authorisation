import mongoose from 'mongoose';
import { logger } from '../src/config/logger';

// Load environment variables
require('dotenv').config();

async function testBasicImports() {
    try {
        logger.info('Testing basic imports...');

        // Test logger
        logger.info('Logger is working!');
        logger.warn('This is a warning message');
        logger.error('This is an error message');

        // Test MongoDB connection
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/matka-sk';
        logger.info('Attempting to connect to MongoDB...');

        await mongoose.connect(mongoUri);
        logger.info('✅ MongoDB connection successful!');

        // Test basic database operations
        const collections = await mongoose.connection.db.listCollections().toArray();
        logger.info(`Found ${collections.length} collections in database`);

        collections.forEach(collection => {
            logger.info(`- ${collection.name}`);
        });

    } catch (error) {
        logger.error('Test failed:', error);
    } finally {
        // Close MongoDB connection
        if (mongoose.connection.readyState === 1) {
            await mongoose.disconnect();
            logger.info('Disconnected from MongoDB');
        }
        process.exit(0);
    }
}

// Run the test
testBasicImports();
