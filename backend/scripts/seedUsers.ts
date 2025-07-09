import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from '../src/models/User';
import dotenv from 'dotenv';

dotenv.config();

const sampleUsers = [
    // Superadmin
    {
        username: 'superadmin',
        password: 'password123',
        balance: 100000,
        role: 'superadmin' as const,
        isActive: true
    },
    // Admins
    {
        username: 'admin1',
        password: 'password123',
        balance: 50000,
        role: 'admin' as const,
        isActive: true
    },
    {
        username: 'admin2',
        password: 'password123',
        balance: 45000,
        role: 'admin' as const,
        isActive: true
    },
    // Distributors
    {
        username: 'distributor1',
        password: 'password123',
        balance: 25000,
        role: 'distributor' as const,
        isActive: true
    },
    {
        username: 'distributor2',
        password: 'password123',
        balance: 20000,
        role: 'distributor' as const,
        isActive: true
    },
    {
        username: 'distributor3',
        password: 'password123',
        balance: 15000,
        role: 'distributor' as const,
        isActive: false
    },
    // Players
    {
        username: 'player1',
        password: 'password123',
        balance: 5000,
        role: 'player' as const,
        isActive: true
    },
    {
        username: 'player2',
        password: 'password123',
        balance: 3000,
        role: 'player' as const,
        isActive: true
    },
    {
        username: 'player3',
        password: 'password123',
        balance: 1000,
        role: 'player' as const,
        isActive: true
    },
    {
        username: 'player4',
        password: 'password123',
        balance: 0,
        role: 'player' as const,
        isActive: false
    }
];

async function seedUsers() {
    try {
        // Connect to MongoDB
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/matka-sk';
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB');

        // Clear existing users (except superadmin)
        await User.deleteMany({ role: { $ne: 'superadmin' } });
        console.log('Cleared existing users');

        // Create users with proper parent relationships
        const createdUsers: any[] = [];

        for (const userData of sampleUsers) {
            if (userData.role === 'superadmin') {
                // Superadmin has no parent
                const user = new User(userData);
                await user.save();
                createdUsers.push(user);
                console.log(`Created ${userData.role}: ${userData.username}`);
            } else if (userData.role === 'admin') {
                // Admins have superadmin as parent
                const superadmin = createdUsers.find(u => u.role === 'superadmin');
                if (superadmin) {
                    const user = new User({
                        ...userData,
                        parentId: superadmin._id
                    });
                    await user.save();
                    createdUsers.push(user);
                    console.log(`Created ${userData.role}: ${userData.username}`);
                }
            } else if (userData.role === 'distributor') {
                // Distributors have admin as parent
                const admin = createdUsers.find(u => u.role === 'admin');
                if (admin) {
                    const user = new User({
                        ...userData,
                        parentId: admin._id
                    });
                    await user.save();
                    createdUsers.push(user);
                    console.log(`Created ${userData.role}: ${userData.username}`);
                }
            } else if (userData.role === 'player') {
                // Players have distributor as parent
                const distributor = createdUsers.find(u => u.role === 'distributor');
                if (distributor) {
                    const user = new User({
                        ...userData,
                        parentId: distributor._id
                    });
                    await user.save();
                    createdUsers.push(user);
                    console.log(`Created ${userData.role}: ${userData.username}`);
                }
            }
        }

        console.log('\n✅ Database seeded successfully!');
        console.log('\nSample users created:');
        console.log('Superadmin: superadmin / password123');
        console.log('Admin: admin1 / password123');
        console.log('Distributor: distributor1 / password123');
        console.log('Player: player1 / password123');

    } catch (error) {
        console.error('Error seeding database:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

// Run the seed function
seedUsers(); 