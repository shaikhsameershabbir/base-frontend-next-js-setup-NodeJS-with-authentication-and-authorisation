import mongoose from 'mongoose';
import { MarketRank } from '../src/models/MarketRank';
import { Market } from '../src/models/Market';
import { User } from '../src/models/User';
import { UserMarketAssignment } from '../src/models/UserMarketAssignment';
import { logger } from '../src/config/logger';

async function testRankReordering() {
    try {
        // Connect to database
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/matka-sk';
        await mongoose.connect(mongoURI);
        logger.info('Connected to database');

        // Find a test admin user
        const admin = await User.findOne({ role: 'admin', isActive: true });
        if (!admin) {
            logger.error('No admin user found');
            return;
        }

        logger.info(`Testing with admin: ${admin.username} (${admin._id})`);

        // Get all market ranks for this admin
        const allRanks = await MarketRank.find({ userId: admin._id }).sort({ rank: 1 });
        logger.info(`Current ranks: ${allRanks.map(r => `${r.marketName}: ${r.rank}`).join(', ')}`);

        if (allRanks.length < 2) {
            logger.error('Need at least 2 markets to test reordering');
            return;
        }

        // Test case: Move the last market to rank 1
        const lastMarket = allRanks[allRanks.length - 1];
        const firstMarket = allRanks[0];

        logger.info(`\n=== Testing: Move ${lastMarket.marketName} from rank ${lastMarket.rank} to rank 1 ===`);

        // Simulate the reordering logic
        const currentRank = lastMarket.rank;
        const newRank = 1;
        const marketId = lastMarket.marketId;

        // Step 1: Temporarily set to high rank
        await MarketRank.findOneAndUpdate(
            { userId: admin._id, marketId: marketId },
            { rank: 999999 }
        );

        // Step 2: Shift other markets
        if (newRank < currentRank) {
            await MarketRank.updateMany(
                {
                    userId: admin._id,
                    marketId: { $ne: marketId },
                    rank: { $gte: newRank, $lt: currentRank }
                },
                { $inc: { rank: 1 } }
            );
        }

        // Step 3: Set final rank
        await MarketRank.findOneAndUpdate(
            { userId: admin._id, marketId: marketId },
            { rank: newRank }
        );

        // Check results
        const updatedRanks = await MarketRank.find({ userId: admin._id }).sort({ rank: 1 });
        logger.info(`After reordering: ${updatedRanks.map(r => `${r.marketName}: ${r.rank}`).join(', ')}`);

        // Verify no duplicate ranks
        const rankCounts = updatedRanks.reduce((acc, rank) => {
            acc[rank.rank] = (acc[rank.rank] || 0) + 1;
            return acc;
        }, {} as Record<number, number>);

        const duplicates = Object.entries(rankCounts).filter(([rank, count]) => count > 1);
        if (duplicates.length > 0) {
            logger.error(`Duplicate ranks found: ${duplicates.map(([rank, count]) => `Rank ${rank}: ${count} markets`).join(', ')}`);
        } else {
            logger.info('✓ No duplicate ranks found');
        }

        // Verify the moved market is at rank 1
        const movedMarket = updatedRanks.find(r => r.marketId.toString() === marketId.toString());
        if (movedMarket && movedMarket.rank === 1) {
            logger.info(`✓ ${movedMarket.marketName} successfully moved to rank 1`);
        } else {
            logger.error(`✗ ${lastMarket.marketName} not at rank 1`);
        }

        logger.info('Test completed');

    } catch (error) {
        logger.error('Test failed:', error);
    } finally {
        await mongoose.disconnect();
    }
}

testRankReordering(); 