import mongoose from 'mongoose';
import { User } from '../src/models/User';
import { Market } from '../src/models/Market';
import { UserMarketAssignment } from '../src/models/UserMarketAssignment';
import { MarketRank } from '../src/models/marketRank';
import { logger } from '../src/config/logger';

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/matka-sk';

const testMarketRanks = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(MONGODB_URI);
        logger.info('Connected to MongoDB');

        logger.info('=== Testing Market Ranking System ===');

        // Step 1: Check for admin users
        const admins = await User.find({ role: 'admin', isActive: true });
        logger.info(`Found ${admins.length} admin users`);

        if (admins.length === 0) {
            logger.warn('No admin users found. Please create admin users first.');
            process.exit(0);
        }

        // Step 2: Check for markets
        const markets = await Market.find({ isActive: true });
        logger.info(`Found ${markets.length} active markets`);

        if (markets.length === 0) {
            logger.warn('No active markets found. Please create markets first.');
            process.exit(0);
        }

        // Step 3: Check market assignments
        const assignments = await UserMarketAssignment.find({ isActive: true });
        logger.info(`Found ${assignments.length} active market assignments`);

        // Step 4: Check for null marketId assignments
        const nullAssignments = assignments.filter(a => !a.marketId);
        if (nullAssignments.length > 0) {
            logger.warn(`Found ${nullAssignments.length} assignments with null marketId`);
        }

        // Step 5: Check market ranks
        const ranks = await MarketRank.find({});
        logger.info(`Found ${ranks.length} market ranks`);

        // Step 6: Check for duplicate ranks
        const rankGroups = new Map();
        ranks.forEach(rank => {
            const key = `${rank.userId}_${rank.marketId}`;
            if (!rankGroups.has(key)) {
                rankGroups.set(key, []);
            }
            rankGroups.get(key).push(rank);
        });

        let duplicates = 0;
        for (const [key, rankList] of rankGroups) {
            if (rankList.length > 1) {
                duplicates++;
                logger.warn(`Found ${rankList.length} duplicate ranks for key: ${key}`);
            }
        }

        if (duplicates > 0) {
            logger.warn(`Found ${duplicates} groups with duplicate ranks`);
        } else {
            logger.info('No duplicate ranks found');
        }

        // Step 7: Test data integrity
        logger.info('Testing data integrity...');
        let integrityIssues = 0;

        for (const assignment of assignments) {
            try {
                await assignment.populate('marketId');
                if (!assignment.marketId) {
                    integrityIssues++;
                    logger.warn(`Assignment ${assignment._id} has invalid marketId reference`);
                }
            } catch (error) {
                integrityIssues++;
                logger.warn(`Assignment ${assignment._id} has invalid marketId reference: ${(error as Error).message}`);
            }
        }

        if (integrityIssues > 0) {
            logger.warn(`Found ${integrityIssues} data integrity issues`);
        } else {
            logger.info('All data integrity checks passed');
        }

        // Summary
        logger.info('=== Test Summary ===');
        logger.info(`Admin users: ${admins.length}`);
        logger.info(`Active markets: ${markets.length}`);
        logger.info(`Market assignments: ${assignments.length}`);
        logger.info(`Market ranks: ${ranks.length}`);
        logger.info(`Null assignments: ${nullAssignments.length}`);
        logger.info(`Duplicate rank groups: ${duplicates}`);
        logger.info(`Integrity issues: ${integrityIssues}`);

        if (nullAssignments.length > 0 || duplicates > 0 || integrityIssues > 0) {
            logger.warn('Issues found. Run cleanup scripts to fix them.');
            logger.info('Run: npm run cleanup-all');
        } else {
            logger.info('All tests passed! Market ranking system is ready.');
        }

        process.exit(0);
    } catch (error) {
        logger.error('Error during testing:', error);
        process.exit(1);
    }
};

testMarketRanks(); 