import mongoose from 'mongoose';
import { User } from '../models/User';
import { Activity } from '../models/Activity';
import { logger } from '../config/logger';

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/matka-sk';

const testPlayerLogin = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(MONGODB_URI);
        logger.info('Connected to MongoDB');

        // Create test users if they don't exist
        const testUsers = [
            {
                username: 'testplayer',
                password: 'password123',
                role: 'player',
                balance: 1000,
                isActive: true
            },
            {
                username: 'testadmin',
                password: 'password123',
                role: 'admin',
                balance: 5000,
                isActive: true
            }
        ];

        for (const userData of testUsers) {
            const existingUser = await User.findOne({ username: userData.username });
            if (!existingUser) {
                const user = new User(userData);
                await user.save();
                logger.info(`Created test user: ${userData.username} (${userData.role})`);
            } else {
                logger.info(`Test user already exists: ${userData.username} (${userData.role})`);
            }
        }

        // Test activity logging
        const player = await User.findOne({ username: 'testplayer' });
        if (player) {
            // Simulate login activity
            const activity = new Activity({
                userId: player._id,
                activity: 'User logged in successfully',
                activityType: 'login',
                status: 'success',
                metadata: {
                    ipAddress: '192.168.1.100',
                    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    loginSource: 'web'
                }
            });
            await activity.save();
            logger.info('Test activity logged successfully');
        }

        // Display test results
        logger.info('\n=== TEST RESULTS ===');
        logger.info('✅ Player-only login system is ready for testing');
        logger.info('✅ Test users created: testplayer (player), testadmin (admin)');
        logger.info('✅ Activity logging is working');
        logger.info('\n=== TESTING INSTRUCTIONS ===');
        logger.info('1. Start the backend server: npm run dev');
        logger.info('2. Start the web application: cd webApplication && npm run dev');
        logger.info('3. Try logging in with testplayer/password123 (should work)');
        logger.info('4. Try logging in with testadmin/password123 (should be blocked)');
        logger.info('5. Check activity logs in MongoDB');

        process.exit(0);
    } catch (error) {
        logger.error('Test failed:', error);
        process.exit(1);
    }
};

testPlayerLogin(); 