import mongoose from 'mongoose';
import { User } from '../src/models/User';
import { logger } from '../src/config/logger';

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/matka-sk';

const seedData = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(MONGODB_URI);
        logger.info('Connected to MongoDB');

        // Clear existing users (optional - comment out if you want to keep existing data)
        // await User.deleteMany({});
        // logger.info('Cleared existing users');

        // Create admin user
        const adminData = {
            username: 'admin',
            password: 'admin123',
            balance: 10000,
            role: 'admin' as const,
            isActive: true
        };

        let adminUser = await User.findOne({ username: adminData.username });
        if (!adminUser) {
            adminUser = new User(adminData);
            await adminUser.save();
            logger.info('✅ Admin user created');
            logger.info(`   Username: ${adminData.username}`);
            logger.info(`   Password: ${adminData.password}`);
            logger.info(`   Balance: ${adminData.balance}`);
            logger.info(`   Role: ${adminData.role}`);
        } else {
            logger.info('ℹ️  Admin user already exists');
        }

        // Create test user
        const testUserData = {
            username: 'testuser',
            password: 'test123',
            balance: 5000,
            role: 'user' as const,
            isActive: true
        };

        let testUser = await User.findOne({ username: testUserData.username });
        if (!testUser) {
            testUser = new User(testUserData);
            await testUser.save();
            logger.info('✅ Test user created');
            logger.info(`   Username: ${testUserData.username}`);
            logger.info(`   Password: ${testUserData.password}`);
            logger.info(`   Balance: ${testUserData.balance}`);
            logger.info(`   Role: ${testUserData.role}`);
        } else {
            logger.info('ℹ️  Test user already exists');
        }

        // Create another test user
        const playerData = {
            username: 'player1',
            password: 'player123',
            balance: 2500,
            role: 'user' as const,
            isActive: true
        };

        let playerUser = await User.findOne({ username: playerData.username });
        if (!playerUser) {
            playerUser = new User(playerData);
            await playerUser.save();
            logger.info('✅ Player user created');
            logger.info(`   Username: ${playerData.username}`);
            logger.info(`   Password: ${playerData.password}`);
            logger.info(`   Balance: ${playerData.balance}`);
            logger.info(`   Role: ${playerData.role}`);
        } else {
            logger.info('ℹ️  Player user already exists');
        }

        logger.info('\n🎉 Seed data creation completed!');
        logger.info('\n📋 Available users:');
        logger.info('   Admin: admin / admin123 (Balance: 10000)');
        logger.info('   Test: testuser / test123 (Balance: 5000)');
        logger.info('   Player: player1 / player123 (Balance: 2500)');

        process.exit(0);
    } catch (error) {
        logger.error('❌ Error creating seed data:', error);
        process.exit(1);
    }
};

// Run the script
seedData(); 