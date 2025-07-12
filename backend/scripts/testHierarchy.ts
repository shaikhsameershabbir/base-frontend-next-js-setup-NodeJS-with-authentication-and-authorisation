import mongoose from 'mongoose';
import { User } from '../src/models/User';
import { UserHierarchy } from '../src/models/UserHierarchy';
import { HierarchyService } from '../src/services/hierarchyService';

async function testHierarchy() {
    try {
        // Connect to MongoDB
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/matka-sk';
        await mongoose.connect(mongoURI);
        console.log('✅ Connected to MongoDB');

        // Clear existing data
        await User.deleteMany({});
        await UserHierarchy.deleteMany({});
        console.log('✅ Cleared existing data');

        // Create superadmin
        const superadmin = new User({
            username: 'superadmin',
            password: '123456',
            balance: 1000000,
            role: 'superadmin',
            isActive: true
        });
        await superadmin.save();
        console.log('✅ Created superadmin');

        // Create hierarchy entry for superadmin
        await HierarchyService.createHierarchyEntry(superadmin._id.toString(), undefined, 'superadmin');
        console.log('✅ Created superadmin hierarchy');

        // Create admin under superadmin
        const admin = new User({
            username: 'admin1',
            password: '123456',
            balance: 100000,
            role: 'admin',
            parentId: superadmin._id,
            isActive: true
        });
        await admin.save();
        console.log('✅ Created admin');

        // Create hierarchy entry for admin
        await HierarchyService.createHierarchyEntry(admin._id.toString(), superadmin._id.toString(), 'admin');
        await HierarchyService.updateAncestorCounts(admin._id.toString());
        console.log('✅ Created admin hierarchy');

        // Create distributor under admin
        const distributor = new User({
            username: 'distributor1',
            password: '123456',
            balance: 50000,
            role: 'distributor',
            parentId: admin._id,
            isActive: true
        });
        await distributor.save();
        console.log('✅ Created distributor');

        // Create hierarchy entry for distributor
        await HierarchyService.createHierarchyEntry(distributor._id.toString(), admin._id.toString(), 'distributor');
        await HierarchyService.updateAncestorCounts(distributor._id.toString());
        console.log('✅ Created distributor hierarchy');

        // Create agent under distributor
        const agent = new User({
            username: 'agent1',
            password: '123456',
            balance: 25000,
            role: 'agent',
            parentId: distributor._id,
            isActive: true
        });
        await agent.save();
        console.log('✅ Created agent');

        // Create hierarchy entry for agent
        await HierarchyService.createHierarchyEntry(agent._id.toString(), distributor._id.toString(), 'agent');
        await HierarchyService.updateAncestorCounts(agent._id.toString());
        console.log('✅ Created agent hierarchy');

        // Create player under agent
        const player = new User({
            username: 'player1',
            password: '123456',
            balance: 1000,
            role: 'player',
            parentId: agent._id,
            isActive: true
        });
        await player.save();
        console.log('✅ Created player');

        // Create hierarchy entry for player
        await HierarchyService.createHierarchyEntry(player._id.toString(), agent._id.toString(), 'player');
        await HierarchyService.updateAncestorCounts(player._id.toString());
        console.log('✅ Created player hierarchy');

        // Test hierarchy queries
        console.log('\n🔍 Testing hierarchy queries...');

        // Get superadmin's downline
        const superadminDownline = await HierarchyService.getDownlineUsers(superadmin._id.toString());
        console.log(`Superadmin downline count: ${superadminDownline.length}`);

        // Get admin's downline
        const adminDownline = await HierarchyService.getDownlineUsers(admin._id.toString());
        console.log(`Admin downline count: ${adminDownline.length}`);

        // Get distributor's downline
        const distributorDownline = await HierarchyService.getDownlineUsers(distributor._id.toString());
        console.log(`Distributor downline count: ${distributorDownline.length}`);

        // Get agent's downline
        const agentDownline = await HierarchyService.getDownlineUsers(agent._id.toString());
        console.log(`Agent downline count: ${agentDownline.length}`);

        // Test direct children
        const adminChildren = await HierarchyService.getDirectChildren(admin._id.toString());
        console.log(`Admin direct children count: ${adminChildren.length}`);

        const distributorChildren = await HierarchyService.getDirectChildren(distributor._id.toString());
        console.log(`Distributor direct children count: ${distributorChildren.length}`);

        // Test role validation
        console.log('\n🔍 Testing role validation...');
        const canAdminCreateDistributor = HierarchyService.canCreateRole('admin', 'distributor');
        console.log(`Can admin create distributor: ${canAdminCreateDistributor}`);

        const canDistributorCreateAgent = HierarchyService.canCreateRole('distributor', 'agent');
        console.log(`Can distributor create agent: ${canDistributorCreateAgent}`);

        const canAgentCreatePlayer = HierarchyService.canCreateRole('agent', 'player');
        console.log(`Can agent create player: ${canAgentCreatePlayer}`);

        const canPlayerCreateAdmin = HierarchyService.canCreateRole('player', 'admin');
        console.log(`Can player create admin: ${canPlayerCreateAdmin}`);

        // Display hierarchy structure
        console.log('\n📊 Hierarchy Structure:');
        const allHierarchies = await UserHierarchy.find().populate('userId', 'username role');
        allHierarchies.forEach(h => {
            console.log(`${'  '.repeat(h.level)}${h.userId.username} (${h.userId.role}) - Level ${h.level}`);
        });

        console.log('\n✅ Hierarchy test completed successfully!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error testing hierarchy:', error);
        process.exit(1);
    }
}

testHierarchy(); 