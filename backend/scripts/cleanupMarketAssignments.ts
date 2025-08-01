import mongoose from 'mongoose';
import { UserMarketAssignment } from '../src/models/UserMarketAssignment';
import { logger } from '../src/config/logger';

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/matka-sk';

const cleanupMarketAssignments = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(MONGODB_URI);


        // Find assignments with null marketId
        const orphanedAssignments = await UserMarketAssignment.find({
            marketId: null
        });



        if (orphanedAssignments.length > 0) {
            // Delete orphaned assignments
            await UserMarketAssignment.deleteMany({
                marketId: null
            });
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
                logger.warn(`Assignment ${assignment._id} has invalid marketId reference: ${(error as Error).message}`);
            }
        }



        process.exit(0);
    } catch (error) {
        logger.error('Error cleaning up market assignments:', error);
        process.exit(1);
    }
};

cleanupMarketAssignments(); 