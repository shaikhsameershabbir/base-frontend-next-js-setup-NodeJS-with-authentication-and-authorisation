import mongoose from 'mongoose';
import { User } from '../src/models/User';
import { UserHierarchy } from '../src/models/UserHierarchy';
import { HierarchyService } from '../src/services/hierarchyService';

async function seedData() {
    try {
        // Connect to MongoDB
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/matka-sk';
        await mongoose.connect(mongoURI);
        console.log('Connected to MongoDB');

        // Clear existing data
        await User.deleteMany({});
        await UserHierarchy.deleteMany({});
        console.log('Cleared existing users and hierarchy data');

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

        // Create 3 agents under each distributor (45 total)
        const agents = [];
        for (let distIndex = 0; distIndex < distributors.length; distIndex++) {
            for (let agentIndex = 1; agentIndex <= 3; agentIndex++) {
                const agent = new User({
                    username: `agent${distIndex + 1}_${agentIndex}`,
                    password: 'agent123',
                    balance: 25000,
                    role: 'agent',
                    parentId: distributors[distIndex]._id,
                    isActive: true
                });
                await agent.save();
                agents.push(agent);
                console.log(`Created agent${distIndex + 1}_${agentIndex}`);
            }
        }

        // Create 3 players under each agent (135 total)
        let playerCount = 0;
        for (let agentIndex = 0; agentIndex < agents.length; agentIndex++) {
            for (let playerIndex = 1; playerIndex <= 3; playerIndex++) {
                playerCount++;
                const player = new User({
                    username: `player${playerCount}`,
                    password: 'player123',
                    balance: 1000 + (playerCount * 100), // Varying balance
                    role: 'player',
                    parentId: agents[agentIndex]._id,
                    isActive: true
                });
                await player.save();
                console.log(`Created player${playerCount}`);
            }
        }

        // Create hierarchy entries for all users
        console.log('\nCreating hierarchy entries...');

        // Get all users to create hierarchy
        const allUsers = await User.find({}).sort({ createdAt: 1 });

        // Create hierarchy entries
        await HierarchyService.bulkCreateHierarchy(allUsers);

        // Update downline counts for all users
        console.log('Updating downline counts...');
        for (const user of allUsers) {
            await HierarchyService.updateDownlineCounts(user._id as mongoose.Types.ObjectId);
        }

        console.log('\n=== Seed Data Summary ===');
        console.log('Superadmin: smasher / 123456');
        console.log('Admins: admin1-admin5 / admin123');
        console.log('Distributors: distributor1_1-distributor5_3 / dist123');
        console.log('Agents: agent1_1-agent45_3 / agent123');
        console.log('Players: player1-player135 / player123');
        console.log('\n=== Hierarchy Structure ===');
        console.log('1 Superadmin');
        console.log('├── 5 Admins');
        console.log('    ├── 15 Distributors (3 per admin)');
        console.log('        ├── 45 Agents (3 per distributor)');
        console.log('            ├── 135 Players (3 per agent)');
        console.log('\nTotal Users Created: 201');
        console.log('Hierarchy entries created successfully!');
        console.log('\nSeed data created successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
}

seedData(); 