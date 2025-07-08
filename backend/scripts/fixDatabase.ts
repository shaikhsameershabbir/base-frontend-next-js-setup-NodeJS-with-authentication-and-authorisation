import mongoose from 'mongoose';
import { logger } from '../src/config/logger';

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/matka-sk';

const fixDatabase = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(MONGODB_URI);
        logger.info('Connected to MongoDB');

        // Check if db connection exists
        if (!mongoose.connection.db) {
            throw new Error('Database connection not available');
        }

        // Drop the users collection to remove old indexes
        await mongoose.connection.db.dropCollection('users');
        logger.info('✅ Dropped users collection');

        // Recreate the collection with new schema
        await mongoose.connection.db.createCollection('users');
        logger.info('✅ Recreated users collection');

        logger.info('🎉 Database fixed successfully!');
        logger.info('You can now run: npm run seed');

        process.exit(0);
    } catch (error) {
        logger.error('❌ Error fixing database:', error);
        process.exit(1);
    }
};

// Run the script
fixDatabase(); 