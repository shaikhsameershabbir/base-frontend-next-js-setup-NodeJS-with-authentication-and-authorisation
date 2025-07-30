import mongoose from 'mongoose';
import { User } from '../src/models/User';
import { logger } from '../src/config/logger';

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/matka-sk';

const createAdminUser = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(MONGODB_URI);


        // Check if admin already exists
        const existingAdmin = await User.findOne({ username: 'admin' });

        if (existingAdmin) {

            process.exit(0);
        }

        // Create admin user
        const adminUser = new User({
            username: 'admin',
            password: 'admin123',
            balance: 10000,
            role: 'admin',
            isActive: true
        });

        await adminUser.save();



        process.exit(0);
    } catch (error) {
        logger.error('Error creating admin user:', error);
        process.exit(1);
    }
};

// Run the script
createAdminUser(); 