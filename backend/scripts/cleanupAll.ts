import mongoose from 'mongoose';
import { UserMarketAssignment } from '../src/models/UserMarketAssignment';
import { MarketRank } from '../src/models/MarketRank';
import { logger } from '../src/config/logger';

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/matka-sk';

const cleanupAll = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(MONGODB_URI);
        logger.info('Connected to MongoDB');

        logger.info('=== Starting comprehensive cleanup ===');

        // Step 1: Clean up orphaned market assignments
        logger.info('Step 1: Cleaning up orphaned market assignments...');
        const orphanedAssignments = await UserMarketAssignment.find({
            marketId: null
        });

        logger.info(`Found ${orphanedAssignments.length} orphaned market assignments`);

        if (orphanedAssignments.length > 0) {
            const result = await UserMarketAssignment.deleteMany({
                marketId: null
            });
            logger.info(`Deleted ${result.deletedCount} orphaned market assignments`);
        }

        // Step 2: Clean up duplicate market ranks
        logger.info('Step 2: Cleaning up duplicate market ranks...');
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
                const [, ...duplicateRanks] = ranks;

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

        // Step 3: Validate market assignments
        logger.info('Step 3: Validating market assignments...');
        const assignments = await UserMarketAssignment.find({});
        let invalidAssignments = 0;

        for (const assignment of assignments) {
            try {
                await assignment.populate('marketId');
                if (!assignment.marketId) {
                    invalidAssignments++;
                    logger.warn(`Assignment ${assignment._id} has invalid marketId reference`);
                }
            } catch (error) {
                invalidAssignments++;
                logger.warn(`Assignment ${assignment._id} has invalid marketId reference: ${(error as Error).message}`);
            }
        }

        if (invalidAssignments > 0) {
            logger.warn(`Found ${invalidAssignments} assignments with invalid marketId references`);
        } else {
            logger.info('All market assignments have valid marketId references');
        }

        // Final summary
        logger.info('=== Cleanup Summary ===');
        logger.info(`Orphaned assignments removed: ${orphanedAssignments.length}`);
        logger.info(`Duplicate ranks removed: ${duplicatesRemoved}`);
        logger.info(`Invalid assignments found: ${invalidAssignments}`);

        const finalAssignmentCount = await UserMarketAssignment.countDocuments();
        const finalRankCount = await MarketRank.countDocuments();

        logger.info(`Final assignment count: ${finalAssignmentCount}`);
        logger.info(`Final market rank count: ${finalRankCount}`);
        logger.info('=== Cleanup completed ===');

        process.exit(0);
    } catch (error) {
        logger.error('Error during cleanup:', error);
        process.exit(1);
    }
};

cleanupAll(); 