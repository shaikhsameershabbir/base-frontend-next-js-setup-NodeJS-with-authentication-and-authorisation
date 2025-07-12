// scripts/createSuperadmin.ts

import mongoose from 'mongoose';
import { User } from '../src/models/User';

import { HierarchyService } from '../src/services/hierarchyService';

async function createSuperadmin() {
    try {
        // Connect to MongoDB
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/matka-sk';
        await mongoose.connect(mongoURI);
        console.log('Connected to MongoDB');

        // Check if superadmin already exists
        const existing = await User.findOne({ username: 'smasher', role: 'superadmin' });
        if (existing) {
            console.log('Superadmin already exists:', existing.username);
            process.exit(0);
        }

        // Create superadmin user
        const superadmin = new User({
            username: 'smasher',
            password: '123456',
            balance: 1000000,
            role: 'superadmin',
            isActive: true
        });
        await superadmin.save();
        console.log('Created superadmin: smasher');

        // Create hierarchy entry
        await HierarchyService.createHierarchyEntry(
            (superadmin._id as { toString(): string }).toString(),
            undefined,
            'superadmin'
        );
        console.log('Created hierarchy entry for superadmin.');

        process.exit(0);
    } catch (error) {
        console.error('Error creating superadmin:', error);
        process.exit(1);
    }
}

createSuperadmin(); 