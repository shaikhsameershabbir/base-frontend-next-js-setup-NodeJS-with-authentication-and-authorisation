import mongoose from 'mongoose';
import { User } from '../src/models/User';
import { Bet } from '../src/models/Bet';
import { HierarchyService } from '../src/services/hierarchyService';
import bcrypt from 'bcryptjs';

async function createTestData() {
    try {
        // Connect to MongoDB
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/matka-sk';
        await mongoose.connect(mongoURI);
        console.log('Connected to MongoDB');

        // Find superadmin first
        const superadmin = await User.findOne({ role: 'superadmin' });
        if (!superadmin) {
            console.log('Superadmin not found. Please run the seedData script first.');
            process.exit(1);
        }

        // Create test admin user
        const adminPassword = await bcrypt.hash('123456', 10);
        let admin = await User.findOne({ username: 'testadmin', role: 'admin' });
        if (!admin) {
            admin = new User({
                username: 'testadmin',
                password: adminPassword,
                balance: 500000,
                role: 'admin',
                parentId: superadmin._id,
                isActive: true
            });
            await admin.save();
            console.log('Created test admin: testadmin');
        }

        // Create test distributor
        const distributorPassword = await bcrypt.hash('123456', 10);
        let distributor = await User.findOne({ username: 'testdistributor', role: 'distributor' });
        if (!distributor) {
            distributor = new User({
                username: 'testdistributor',
                password: distributorPassword,
                balance: 200000,
                role: 'distributor',
                parentId: admin._id,
                isActive: true
            });
            await distributor.save();
            console.log('Created test distributor: testdistributor');
        }

        // Create test agent
        const agentPassword = await bcrypt.hash('123456', 10);
        let agent = await User.findOne({ username: 'testagent', role: 'agent' });
        if (!agent) {
            agent = new User({
                username: 'testagent',
                password: agentPassword,
                balance: 100000,
                role: 'agent',
                parentId: distributor._id,
                isActive: true
            });
            await agent.save();
            console.log('Created test agent: testagent');
        }

        // Create test player
        const playerPassword = await bcrypt.hash('123456', 10);
        let player = await User.findOne({ username: 'testplayer', role: 'player' });
        if (!player) {
            player = new User({
                username: 'testplayer',
                password: playerPassword,
                balance: 50000,
                role: 'player',
                parentId: agent._id,
                isActive: true
            });
            await player.save();
            console.log('Created test player: testplayer');
        }

        // Create hierarchy entries
        if (admin) {
            await HierarchyService.createHierarchyEntry(
                (admin._id as any).toString(),
                undefined,
                'admin'
            );
        }

        if (distributor) {
            await HierarchyService.createHierarchyEntry(
                (distributor._id as any).toString(),
                (admin._id as any).toString(),
                'distributor'
            );
        }

        if (agent) {
            await HierarchyService.createHierarchyEntry(
                (agent._id as any).toString(),
                (distributor._id as any).toString(),
                'agent'
            );
        }

        if (player) {
            await HierarchyService.createHierarchyEntry(
                (player._id as any).toString(),
                (agent._id as any).toString(),
                'player'
            );
        }

        // Create some test bets
        const testBets = [
            {
                userId: (player._id as any),
                marketId: new mongoose.Types.ObjectId(), // Mock market ID
                type: 'single',
                betType: 'open',
                amount: 1000,
                userBeforeAmount: 50000,
                userAfterAmount: 49000,
                status: true,
                selectedNumbers: { 123: 1000 },
                winAmount: 9000,
                claimStatus: true
            },
            {
                userId: (player._id as any),
                marketId: new mongoose.Types.ObjectId(), // Mock market ID
                type: 'double',
                betType: 'close',
                amount: 500,
                userBeforeAmount: 49000,
                userAfterAmount: 48500,
                status: true,
                selectedNumbers: { 456: 500 },
                winAmount: 0,
                claimStatus: false
            },
            {
                userId: (player._id as any),
                marketId: new mongoose.Types.ObjectId(), // Mock market ID
                type: 'panna',
                betType: 'both',
                amount: 2000,
                userBeforeAmount: 48500,
                userAfterAmount: 46500,
                status: true,
                selectedNumbers: { 789: 2000 },
                winAmount: 18000,
                claimStatus: false
            }
        ];

        for (const betData of testBets) {
            const existingBet = await Bet.findOne({
                userId: betData.userId,
                amount: betData.amount,
                type: betData.type
            });

            if (!existingBet) {
                const bet = new Bet(betData);
                await bet.save();
                console.log(`Created test bet: ${betData.type} - ${betData.amount}`);
            }
        }

        console.log('Test data creation completed!');
        process.exit(0);
    } catch (error) {
        console.error('Error creating test data:', error);
        process.exit(1);
    }
}

createTestData();
