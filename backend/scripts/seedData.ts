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
            username: 'smasher',
            password: '123456',
            balance: 1000000,
            role: 'superadmin',
            isActive: true
        });
        await superadmin.save();
        console.log('Created superadmin: smasher');

        // Create 5 admins under superadmin
        const admins = [];
        for (let i = 1; i <= 5; i++) {
            const admin = new User({
                username: `admin${i}`,
                password: 'admin123',
                balance: 100000,
                role: 'admin',
                parentId: superadmin._id,
                isActive: true
            });
            await admin.save();
            admins.push(admin);
            console.log(`Created admin${i}`);
        }

        // Create 3 distributors under each admin (15 total)
        const distributors = [];
        for (let adminIndex = 0; adminIndex < admins.length; adminIndex++) {
            for (let distIndex = 1; distIndex <= 3; distIndex++) {
                const distributor = new User({
                    username: `distributor${adminIndex + 1}_${distIndex}`,
                    password: 'dist123',
                    balance: 50000,
                    role: 'distributor',
                    parentId: admins[adminIndex]._id,
                    isActive: true
                });
                await distributor.save();
                distributors.push(distributor);
                console.log(`Created distributor${adminIndex + 1}_${distIndex}`);
            }
        }

        // Create 3 sub-distributors under each distributor (45 total)
        const subDistributors = [];
        for (let distIndex = 0; distIndex < distributors.length; distIndex++) {
            for (let subDistIndex = 1; subDistIndex <= 3; subDistIndex++) {
                const subDistributor = new User({
                    username: `subdist${distIndex + 1}_${subDistIndex}`,
                    password: 'subdist123',
                    balance: 25000,
                    role: 'distributor',
                    parentId: distributors[distIndex]._id,
                    isActive: true
                });
                await subDistributor.save();
                subDistributors.push(subDistributor);
                console.log(`Created subdist${distIndex + 1}_${subDistIndex}`);
            }
        }

        // Create 3 players under each sub-distributor (135 total)
        let playerCount = 0;
        for (let subDistIndex = 0; subDistIndex < subDistributors.length; subDistIndex++) {
            for (let playerIndex = 1; playerIndex <= 3; playerIndex++) {
                playerCount++;
                const player = new User({
                    username: `player${playerCount}`,
                    password: 'player123',
                    balance: 1000 + (playerCount * 100), // Varying balance
                    role: 'player',
                    parentId: subDistributors[subDistIndex]._id,
                    isActive: true
                });
                await player.save();
                console.log(`Created player${playerCount}`);
            }
        }

        console.log('\n=== Seed Data Summary ===');
        console.log('Superadmin: smasher / 123456');
        console.log('Admins: admin1-admin5 / admin123');
        console.log('Distributors: distributor1_1-distributor5_3 / dist123');
        console.log('Sub-Distributors: subdist1_1-subdist45_3 / subdist123');
        console.log('Players: player1-player135 / player123');
        console.log('\n=== Hierarchy Structure ===');
        console.log('1 Superadmin');
        console.log('├── 5 Admins');
        console.log('    ├── 15 Distributors (3 per admin)');
        console.log('        ├── 45 Sub-Distributors (3 per distributor)');
        console.log('            ├── 135 Players (3 per sub-distributor)');
        console.log('\nTotal Users Created: 201');
        console.log('\nSeed data created successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
}

seedData(); 