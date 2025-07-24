import { Schema, model, Document, ObjectId } from 'mongoose';

export interface IMarketRank extends Document {
    marketName: string;
    marketId: ObjectId;
    rank: number;
    userId: ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const marketRankSchema = new Schema<IMarketRank>({
    marketName: {
        type: String,
        required: true,
        trim: true
    },
    marketId: {
        type: Schema.Types.ObjectId,
        ref: 'Market',
        required: true
    },
    rank: {
        type: Number,
        required: true,
        min: 1
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

// Compound unique index for userId and marketId to ensure one rank per market per user
marketRankSchema.index(
    { userId: 1, marketId: 1 },
    { unique: true }
);

// Index for efficient queries
marketRankSchema.index({ userId: 1, rank: 1 });
marketRankSchema.index({ marketId: 1 });

export const MarketRank = model<IMarketRank>('MarketRank', marketRankSchema); 