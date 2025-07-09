import mongoose from 'mongoose';
import { User } from '../src/models/User';

async function seedData() {
    try {
        // Connect to MongoDB
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/matka-sk';
        await mongoose.connect(mongoURI);
        console.log('Connected to MongoDB');

        // Clear existing data
        await User.deleteMany({});
        console.log('Cleared existing users');

        // Create superadmin
        const superadmin = new User({
            username: 'superadmin',
            password: 'superadmin123',
            balance: 1000000,
            role: 'superadmin',
            isActive: true
        });
        await superadmin.save();
        console.log('Created superadmin');

        // Create admin under superadmin
        const admin = new User({
            username: 'admin',
            password: 'admin123',
            balance: 100000,
            role: 'admin',
            parentId: superadmin._id,
            isActive: true
        });
        await admin.save();
        console.log('Created admin');

        // Create distributors under admin
        const distributor1 = new User({
            username: 'distributor1',
            password: 'dist123',
            balance: 50000,
            role: 'distributor',
            parentId: admin._id,
            isActive: true
        });
        await distributor1.save();

        const distributor2 = new User({
            username: 'distributor2',
            password: 'dist123',
            balance: 30000,
            role: 'distributor',
            parentId: admin._id,
            isActive: true
        });
        await distributor2.save();
        console.log('Created distributors');

        // Create players under distributors
        const player1 = new User({
            username: 'player1',
            password: 'player123',
            balance: 1000,
            role: 'player',
            parentId: distributor1._id,
            isActive: true
        });
        await player1.save();

        const player2 = new User({
            username: 'player2',
            password: 'player123',
            balance: 2000,
            role: 'player',
            parentId: distributor1._id,
            isActive: true
        });
        await player2.save();

        const player3 = new User({
            username: 'player3',
            password: 'player123',
            balance: 1500,
            role: 'player',
            parentId: distributor2._id,
            isActive: true
        });
        await player3.save();

        const player4 = new User({
            username: 'player4',
            password: 'player123',
            balance: 3000,
            role: 'player',
            parentId: distributor2._id,
            isActive: true
        });
        await player4.save();
        console.log('Created players');

        console.log('\n=== Seed Data Summary ===');
        console.log('Superadmin: superadmin / superadmin123');
        console.log('Admin: admin / admin123');
        console.log('Distributor 1: distributor1 / dist123');
        console.log('Distributor 2: distributor2 / dist123');
        console.log('Player 1: player1 / player123');
        console.log('Player 2: player2 / player123');
        console.log('Player 3: player3 / player123');
        console.log('Player 4: player4 / player123');

        console.log('\nSeed data created successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
}

seedData(); 