import mongoose, { Schema, model, Document } from 'mongoose';

export interface IActivity extends Document {
    userId: mongoose.Types.ObjectId;
    activity: string;
    activityType: 'login' | 'logout' | 'bid' | 'win' | 'transfer' | 'registration' | 'balance_update' | 'game_play' | 'market_action' | 'commission' | 'other';
    status: 'success' | 'pending' | 'failed';
    otherInfo: string;
    metadata?: {
        amount?: number;
        gameType?: string;
        marketName?: string;
        targetUserId?: mongoose.Types.ObjectId;
        ipAddress?: string;
        userAgent?: string;
        [key: string]: unknown;
    };
    createdAt: Date;
    updatedAt: Date;
}

const activitySchema = new Schema<IActivity>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    activity: {
        type: String,
        required: true
    },
    activityType: {
        type: String,
        enum: ['login', 'logout', 'bid', 'win', 'transfer', 'registration', 'balance_update', 'game_play', 'market_action', 'commission', 'other'],
        required: true,
        default: 'other',
        index: true
    },
    status: {
        type: String,
        enum: ['success', 'pending', 'failed'],
        required: true,
        default: 'success',
        index: true
    },
    otherInfo: {
        type: String,
        required: false,
        default: null
    },
    metadata: {
        type: Schema.Types.Mixed,
        default: {}
    }
}, {
    timestamps: true
});

// Indexes for efficient querying
activitySchema.index({ userId: 1, createdAt: -1 });
activitySchema.index({ activityType: 1, createdAt: -1 });
activitySchema.index({ status: 1, createdAt: -1 });
activitySchema.index({ createdAt: -1 });

export const Activity = model<IActivity>('Activity', activitySchema);