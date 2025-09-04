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

// Cleanup duplicate results
const cleanupDuplicateResults = async () => {
    try {
        console.log('Starting cleanup of duplicate result documents...');

        // Find all results grouped by marketId, weekStartDate, and weekEndDate
        const results = await Result.aggregate([
            {
                $group: {
                    _id: {
                        marketId: '$marketId',
                        weekStartDate: '$weekStartDate',
                        weekEndDate: '$weekEndDate'
                    },
                    documents: { $push: '$$ROOT' },
                    count: { $sum: 1 }
                }
            },
            {
                $match: {
                    count: { $gt: 1 }
                }
            }
        ]);

        console.log(`Found ${results.length} groups with duplicate results`);

        for (const group of results) {
            const { marketId, weekStartDate, weekEndDate } = group._id;
            const documents = group.documents;

            console.log(`\nProcessing duplicates for marketId: ${marketId}, week: ${weekStartDate} to ${weekEndDate}`);
            console.log(`Found ${documents.length} duplicate documents`);

            // Sort documents by creation date (keep the oldest one)
            documents.sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

            const keepDocument = documents[0];
            const deleteDocuments = documents.slice(1);

            console.log(`Keeping document: ${keepDocument._id} (created: ${keepDocument.createdAt})`);
            console.log(`Deleting ${deleteDocuments.length} duplicate documents`);

            // Merge results from all documents into the one we're keeping
            const mergedResults = { ...keepDocument.results };

            for (const doc of deleteDocuments) {
                console.log(`  - Merging from document: ${doc._id}`);

                // Merge each day's results
                for (const [dayName, dayResult] of Object.entries(doc.results)) {
                    if (dayResult && ((dayResult as any).open || (dayResult as any).close)) {
                        // Only merge if the day has actual results
                        if (!mergedResults[dayName] || (!(mergedResults[dayName] as any).open && !(mergedResults[dayName] as any).close)) {
                            mergedResults[dayName] = dayResult;
                        } else {
                            // If both have results, prefer the one with more complete data
                            const existing = mergedResults[dayName] as any;
                            const incoming = dayResult as any;

                            if (incoming.open && !existing.open) {
                                existing.open = incoming.open;
                                existing.main = incoming.main;
                                existing.openDeclationTime = incoming.openDeclationTime;
                            }

                            if (incoming.close && !existing.close) {
                                existing.close = incoming.close;
                                existing.closeDeclationTime = incoming.closeDeclationTime;

                                // Update main if close is being added
                                if (incoming.main) {
                                    existing.main = incoming.main;
                                }
                            }
                        }
                    }
                }
            }

            // Update the document we're keeping with merged results
            await Result.findByIdAndUpdate(keepDocument._id, {
                results: mergedResults,
                updatedAt: new Date()
            });

            // Delete the duplicate documents
            const deleteIds = deleteDocuments.map((doc: any) => doc._id);
            const deleteResult = await Result.deleteMany({ _id: { $in: deleteIds } });

            console.log(`Deleted ${deleteResult.deletedCount} duplicate documents`);
        }

        console.log('\nCleanup completed successfully!');

        // Verify no more duplicates
        const remainingDuplicates = await Result.aggregate([
            {
                $group: {
                    _id: {
                        marketId: '$marketId',
                        weekStartDate: '$weekStartDate',
                        weekEndDate: '$weekEndDate'
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $match: {
                    count: { $gt: 1 }
                }
            }
        ]);

        if (remainingDuplicates.length === 0) {
            console.log('✅ No duplicate results remaining');
        } else {
            console.log(`⚠️  Warning: ${remainingDuplicates.length} groups still have duplicates`);
        }

    } catch (error) {
        console.error('Error during cleanup:', error);
    }
};

// Main execution
const main = async () => {
    await connectDB();
    await cleanupDuplicateResults();
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
};

// Run the script
if (require.main === module) {
    main().catch(console.error);
}

export { cleanupDuplicateResults };
