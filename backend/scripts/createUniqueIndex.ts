import mongoose from 'mongoose';
import { Result } from '../src/models/result';

// Connect to MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/matka-sk');
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

// Create unique index
const createUniqueIndex = async () => {
    try {
        console.log('Creating unique compound index on results collection...');

        // Create the unique compound index
        await Result.collection.createIndex(
            { marketId: 1, weekStartDate: 1, weekEndDate: 1 },
            { unique: true, name: 'unique_market_week' }
        );

        console.log('✅ Unique compound index created successfully!');

        // List all indexes to verify
        const indexes = await Result.collection.getIndexes();
        console.log('\nCurrent indexes on results collection:');
        console.log(JSON.stringify(indexes, null, 2));

    } catch (error: any) {
        if (error.code === 85) {
            console.log('⚠️  Index already exists');
        } else {
            console.error('Error creating index:', error);
        }
    }
};

// Main execution
const main = async () => {
    await connectDB();
    await createUniqueIndex();
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
};

// Run the script
if (require.main === module) {
    main().catch(console.error);
}

export { createUniqueIndex };
