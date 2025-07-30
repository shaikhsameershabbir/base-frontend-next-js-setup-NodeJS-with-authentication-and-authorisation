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



        // Step 1: Clean up orphaned market assignments
        const orphanedAssignments = await UserMarketAssignment.find({
            marketId: null
        });


        if (orphanedAssignments.length > 0) {
            await UserMarketAssignment.deleteMany({
                marketId: null
            });
        }

        // Step 2: Clean up duplicate market ranks
        const allRanks = await MarketRank.find({});

        // Group by userId and marketId to find duplicates
        const groupedRanks = new Map();

        allRanks.forEach(rank => {
            const key = `${rank.userId}_${rank.marketId}`;
            if (!groupedRanks.has(key)) {
                groupedRanks.set(key, []);
            }
            groupedRanks.get(key).push(rank);
        });

        // Process each group
        for (const [key, ranks] of groupedRanks) {
            if (ranks.length > 1) {
                logger.warn(`Found ${ranks.length} duplicate ranks for key: ${key}`);

                // Keep the first one (oldest) and remove the rest
                const [, ...duplicateRanks] = ranks;

                for (const duplicateRank of duplicateRanks) {
                    await MarketRank.findByIdAndDelete(duplicateRank._id);
                }
            }
        }



        // Step 3: Validate market assignments

        const assignments = await UserMarketAssignment.find({});

        for (const assignment of assignments) {
            try {
                await assignment.populate('marketId');
                if (!assignment.marketId) {
                    logger.warn(`Assignment ${assignment._id} has invalid marketId reference`);
                }
            } catch (error) {
                logger.warn(`Assignment ${assignment._id} has invalid marketId reference: ${(error as Error).message}`);
            }
        }





        process.exit(0);
    } catch (error) {
        logger.error('Error during cleanup:', error);
        process.exit(1);
    }
};

cleanupAll(); 