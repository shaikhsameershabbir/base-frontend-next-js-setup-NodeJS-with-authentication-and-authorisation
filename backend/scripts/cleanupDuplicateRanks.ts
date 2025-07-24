import mongoose from 'mongoose';
import { MarketRank } from '../src/models/marketRank';
import { logger } from '../src/config/logger';

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/matka-sk';

const cleanupDuplicateRanks = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(MONGODB_URI);
        logger.info('Connected to MongoDB');

        // Find all market ranks
        const allRanks = await MarketRank.find({});
        logger.info(`Found ${allRanks.length} total market ranks`);

        // Group by userId and marketId to find duplicates
        const groupedRanks = new Map();

        allRanks.forEach(rank => {
            const key = `${rank.userId}_${rank.marketId}`;
            if (!groupedRanks.has(key)) {
                groupedRanks.set(key, []);
            }
            groupedRanks.get(key).push(rank);
        });

        let duplicatesFound = 0;
        let duplicatesRemoved = 0;

        // Process each group
        for (const [key, ranks] of groupedRanks) {
            if (ranks.length > 1) {
                duplicatesFound++;
                logger.warn(`Found ${ranks.length} duplicate ranks for key: ${key}`);

                // Keep the first one (oldest) and remove the rest
                const [keepRank, ...duplicateRanks] = ranks;

                for (const duplicateRank of duplicateRanks) {
                    logger.info(`Removing duplicate rank: ${duplicateRank._id}`);
                    await MarketRank.findByIdAndDelete(duplicateRank._id);
                    duplicatesRemoved++;
                }
            }
        }

        if (duplicatesFound > 0) {
            logger.info(`Found ${duplicatesFound} groups with duplicates`);
            logger.info(`Removed ${duplicatesRemoved} duplicate market ranks`);
        } else {
            logger.info('No duplicate market ranks found');
        }

        // Verify the cleanup
        const finalCount = await MarketRank.countDocuments();
        logger.info(`Final market rank count: ${finalCount}`);

        process.exit(0);
    } catch (error) {
        logger.error('Error cleaning up duplicate ranks:', error);
        process.exit(1);
    }
};

cleanupDuplicateRanks(); 