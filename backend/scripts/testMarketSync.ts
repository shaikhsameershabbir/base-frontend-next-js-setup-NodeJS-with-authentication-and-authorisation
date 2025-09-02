import mongoose from 'mongoose';
import { marketSyncService } from '../src/services/marketSyncService';
import { logger } from '../src/config/logger';

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

async function testMarketSync() {
    try {
        // Connect to MongoDB
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/matka-sk';
        await mongoose.connect(mongoUri);
        logger.info('Connected to MongoDB');

        // Test market sync
        logger.info('Testing market sync...');
        const result = await marketSyncService.syncMarkets();

        if (result.success) {
            logger.info('Market sync test successful!');
            logger.info(`Created: ${result.created} markets`);
            logger.info(`Updated: ${result.updated} markets`);
            if (result.errors.length > 0) {
                logger.warn(`Errors encountered: ${result.errors.length}`);
                result.errors.forEach(error => logger.warn(`- ${error}`));
            }
        } else {
            logger.error('Market sync test failed:', result.message);
        }

        // Test sync status
        logger.info('Testing sync status...');
        const status = await marketSyncService.getSyncStatus();
        logger.info('Sync status:', status);

    } catch (error) {
        logger.error('Test failed:', error);
    } finally {
        // Close MongoDB connection
        await mongoose.disconnect();
        logger.info('Disconnected from MongoDB');
        process.exit(0);
    }
}

// Run the test
testMarketSync();
