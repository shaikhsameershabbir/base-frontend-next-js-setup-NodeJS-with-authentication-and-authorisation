import mongoose, { Document, Schema } from 'mongoose';

export interface ITokenBlacklist extends Document {
    tokenId: string;
    userId: string;
    expiresAt: Date;
    createdAt: Date;
}

const tokenBlacklistSchema = new Schema<ITokenBlacklist>({
    tokenId: {
        type: String,
        required: true,
        unique: true
        // Remove index: true since we have compound indexes below
    },
    userId: {
        type: String,
        required: true
        // Remove index: true since we have compound indexes below
    },
    expiresAt: {
        type: Date,
        required: true,
        index: { expireAfterSeconds: 0 } // Auto-delete expired tokens
    }
}, {
    timestamps: true
});

// Compound index for efficient queries
tokenBlacklistSchema.index({ tokenId: 1, userId: 1 });

export const TokenBlacklist = mongoose.model<ITokenBlacklist>('TokenBlacklist', tokenBlacklistSchema);

