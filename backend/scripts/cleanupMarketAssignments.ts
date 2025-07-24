import mongoose from 'mongoose';
import { UserMarketAssignment } from '../src/models/UserMarketAssignment';
import { logger } from '../src/config/logger';

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/matka-sk';

const cleanupMarketAssignments = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(MONGODB_URI);
        logger.info('Connected to MongoDB');

        // Find assignments with null marketId
        const orphanedAssignments = await UserMarketAssignment.find({
            marketId: null
        });

        logger.info(`Found ${orphanedAssignments.length} orphaned market assignments`);

        if (orphanedAssignments.length > 0) {
            // Delete orphaned assignments
            const result = await UserMarketAssignment.deleteMany({
                marketId: null
            });

            logger.info(`Deleted ${result.deletedCount} orphaned market assignments`);
        } else {
            logger.info('No orphaned market assignments found');
        }

        // Also check for assignments with invalid marketId references
        const assignments = await UserMarketAssignment.find({});
        let invalidAssignments = 0;

        for (const assignment of assignments) {
            try {
                // Try to populate marketId to check if it exists
                await assignment.populate('marketId');
                if (!assignment.marketId) {
                    invalidAssignments++;
                    logger.warn(`Assignment ${assignment._id} has invalid marketId reference`);
                }
            } catch (error) {
                invalidAssignments++;
                logger.warn(`Assignment ${assignment._id} has invalid marketId reference: ${error.message}`);
            }
        }

        if (invalidAssignments > 0) {
            logger.warn(`Found ${invalidAssignments} assignments with invalid marketId references`);
        } else {
            logger.info('All market assignments have valid marketId references');
        }

        process.exit(0);
    } catch (error) {
        logger.error('Error cleaning up market assignments:', error);
        process.exit(1);
    }
};

cleanupMarketAssignments(); 