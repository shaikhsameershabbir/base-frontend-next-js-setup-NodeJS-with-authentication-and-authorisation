import mongoose from 'mongoose';
import { User } from '../src/models/User';
import { Market } from '../src/models/Market';
import { UserMarketAssignment } from '../src/models/UserMarketAssignment';
import { config } from 'dotenv';

// Load environment variables
config();

async function setupTestData() {
    try {
        console.log('🔧 Setting up test data...\n');

        // Connect to database
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/matka-sk');
        console.log('✅ Connected to database\n');

        // Create test superadmin if not exists
        console.log('1. Creating test superadmin...');
        let superadmin = await User.findOne({ username: 'superadmin' });

        if (!superadmin) {
            superadmin = new User({
                username: 'superadmin',
                password: 'password123',
                role: 'superadmin',
                balance: 10000,
                isActive: true
            });
            await superadmin.save();
            console.log('✅ Test superadmin created');
        } else {
            console.log('✅ Test superadmin already exists');
        }
        console.log('');

        // Create test player if not exists
        console.log('2. Creating test player...');
        let player = await User.findOne({ username: 'player1' });

        if (!player) {
            player = new User({
                username: 'player1',
                password: 'password123',
                role: 'player',
                balance: 1000,
                isActive: true,
                parentId: superadmin._id
            });
            await player.save();
            console.log('✅ Test player created');
        } else {
            console.log('✅ Test player already exists');
        }
        console.log('');

        // Create test markets if not exist
        console.log('3. Creating test markets...');
        const marketNames = [
            'KARNATAKA DAY',
            'SRIDEVI',
            'TIME BAZAR',
            'MADHUR DAY',
            'RAJDHANI DAY'
        ];

        const markets = [];
        for (const marketName of marketNames) {
            let market = await Market.findOne({ marketName });

            if (!market) {
                // Create market with different times
                const now = new Date();
                const openTime = new Date(now.getTime() + Math.random() * 24 * 60 * 60 * 1000); // Random time today
                const closeTime = new Date(openTime.getTime() + 60 * 60 * 1000); // 1 hour later

                market = new Market({
                    marketName,
                    openTime,
                    closeTime,
                    createdBy: String(superadmin._id),
                    isActive: true
                });
                await market.save();
                console.log(`✅ Created market: ${marketName}`);
            } else {
                console.log(`✅ Market already exists: ${marketName}`);
            }
            markets.push(market);
        }
        console.log('');

        // Assign markets to player
        console.log('4. Assigning markets to player...');
        for (const market of markets) {
            const existingAssignment = await UserMarketAssignment.findOne({
                assignedTo: player._id,
                marketId: market._id,
                isActive: true
            });

            if (!existingAssignment) {
                const assignment = new UserMarketAssignment({
                    assignedBy: player._id, // Self-assigned for testing
                    assignedTo: player._id,
                    marketId: market._id,
                    hierarchyLevel: 'player',
                    isActive: true
                });
                await assignment.save();
                console.log(`✅ Assigned market: ${market.marketName}`);
            } else {
                console.log(`✅ Market already assigned: ${market.marketName}`);
            }
        }
        console.log('');

        console.log('🎉 Test data setup complete!');
        console.log('📋 Test credentials:');
        console.log('   Username: player1');
        console.log('   Password: password123');
        console.log('   Role: player');
        console.log('   Balance: 1000');

    } catch (error) {
        console.error('❌ Error setting up test data:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Disconnected from database');
    }
}

// Run the setup
setupTestData(); 