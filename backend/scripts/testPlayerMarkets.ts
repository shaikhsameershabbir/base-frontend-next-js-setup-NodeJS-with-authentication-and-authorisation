import mongoose from 'mongoose';
import { logger } from '../src/config/logger';
import { User } from '../src/models/User';
import { UserHierarchy } from '../src/models/UserHierarchy';
import { UserMarketAssignment } from '../src/models/UserMarketAssignment';
import { MarketRank } from '../src/models/marketRank';
import { Market } from '../src/models/Market';

async function testPlayerMarkets() {
    try {
        // Connect to MongoDB
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/matka-sk';
        await mongoose.connect(mongoUri);
        logger.info('Connected to MongoDB');

        // Find a player to test with
        const player = await User.findOne({ role: 'player', isActive: true });
        if (!player) {
            logger.error('No active player found');
            return;
        }

        logger.info(`Testing with player: ${player.username} (${player._id})`);

        // Check player hierarchy
        const playerHierarchy = await UserHierarchy.findOne({ userId: player._id });
        if (!playerHierarchy) {
            logger.error('Player hierarchy not found');
            return;
        }

        logger.info(`Player hierarchy found:`, {
            level: playerHierarchy.level,
            parentId: playerHierarchy.parentId,
            pathLength: playerHierarchy.path?.length || 0,
            path: playerHierarchy.path
        });

        // Find admin using different methods
        let adminId = null;

        // Method 1: From path
        if (playerHierarchy.path && playerHierarchy.path.length > 0) {
            adminId = playerHierarchy.path[0];
            logger.info(`Method 1 - Admin from path: ${adminId}`);
        }

        // Method 2: Find admin by level
        if (!adminId) {
            const adminHierarchy = await UserHierarchy.findOne({
                level: 1,
                path: { $in: [player._id] }
            });
            if (adminHierarchy) {
                adminId = adminHierarchy.userId;
                logger.info(`Method 2 - Admin by level: ${adminId}`);
            }
        }

        // Method 3: Through parent chain
        if (!adminId && playerHierarchy.parentId) {
            const parentHierarchy = await UserHierarchy.findOne({ userId: playerHierarchy.parentId });
            if (parentHierarchy) {
                logger.info(`Parent hierarchy:`, {
                    level: parentHierarchy.level,
                    parentId: parentHierarchy.parentId
                });

                if (parentHierarchy.level === 1) {
                    adminId = parentHierarchy.userId;
                    logger.info(`Method 3a - Admin from parent: ${adminId}`);
                } else if (parentHierarchy.parentId) {
                    const grandParentHierarchy = await UserHierarchy.findOne({ userId: parentHierarchy.parentId });
                    if (grandParentHierarchy && grandParentHierarchy.level === 1) {
                        adminId = grandParentHierarchy.userId;
                        logger.info(`Method 3b - Admin from grandparent: ${adminId}`);
                    }
                }
            }
        }

        if (!adminId) {
            logger.error('Could not find admin for player');
            return;
        }

        // Get admin user details
        const adminUser = await User.findById(adminId);
        logger.info(`Admin found: ${adminUser?.username} (${adminId})`);

        // Get player's assigned markets
        const assignments = await UserMarketAssignment.find({ assignedTo: player._id })
            .populate('marketId')
            .populate('assignedBy', 'username');

        logger.info(`Found ${assignments.length} market assignments for player`);

        // Get market ranks from admin
        const marketIds = assignments
            .filter(assignment => assignment.marketId)
            .map(assignment => assignment.marketId);

        logger.info(`Looking for market ranks for admin ${adminId}, market count: ${marketIds.length}`);

        const marketRanks = await MarketRank.find({
            userId: adminId,
            marketId: { $in: marketIds }
        }).sort({ rank: 1 });

        logger.info(`Found ${marketRanks.length} market ranks for admin`);

        // Show market ranks
        for (const rank of marketRanks) {
            const market = await Market.findById(rank.marketId);
            logger.info(`Market rank: ${rank.rank} - ${market?.marketName || 'Unknown'} (${rank.marketId})`);
        }

                // Show assignments without ranks
        const marketsWithoutRanks = assignments.filter(assignment => {
            return !marketRanks.some(rank => 
                rank.marketId.toString() === assignment.marketId.toString()
            );
        });

        logger.info(`Markets without ranks: ${marketsWithoutRanks.length}`);
        for (const assignment of marketsWithoutRanks) {
            const marketName = typeof assignment.marketId === 'object' && assignment.marketId && 'marketName' in assignment.marketId 
                ? (assignment.marketId as any).marketName 
                : 'Unknown';
            logger.info(`No rank: ${marketName} (${assignment.marketId})`);
        }

    } catch (error) {
        logger.error('Test failed:', error);
    } finally {
        await mongoose.disconnect();
        logger.info('Disconnected from MongoDB');
    }
}

// Run the test
testPlayerMarkets(); 