import mongoose, { Document, Schema } from 'mongoose';

export interface IUserMarketAssignment extends Document {
    assignedBy: mongoose.Types.ObjectId; // Who assigned (user ID)
    assignedTo: mongoose.Types.ObjectId; // Who received (user ID)
    marketId: mongoose.Types.ObjectId;   // Which market
    assignedAt: Date;
    isActive: boolean;
    hierarchyLevel: 'admin' | 'distributor' | 'agent' | 'player';
    parentAssignment?: mongoose.Types.ObjectId; // Reference to parent assignment for audit trail
}

const userMarketAssignmentSchema = new Schema<IUserMarketAssignment>({
    assignedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    assignedTo: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    marketId: {
        type: Schema.Types.ObjectId,
        ref: 'Market',
        required: true
    },
    assignedAt: {
        type: Date,
        default: Date.now
    },
    isActive: {
        type: Boolean,
        default: true
    },
    hierarchyLevel: {
        type: String,
        enum: ['admin', 'distributor', 'agent', 'player'],
        required: true
    },
    parentAssignment: {
        type: Schema.Types.ObjectId,
        ref: 'UserMarketAssignment'
    }
}, {
    timestamps: true
});

// Indexes for efficient queries
userMarketAssignmentSchema.index({ assignedTo: 1, isActive: 1 });
userMarketAssignmentSchema.index({ assignedBy: 1 });
userMarketAssignmentSchema.index({ marketId: 1, isActive: 1 });
userMarketAssignmentSchema.index({ hierarchyLevel: 1 });
userMarketAssignmentSchema.index({ parentAssignment: 1 });

// Compound index for unique assignments
userMarketAssignmentSchema.index(
    { assignedTo: 1, marketId: 1, isActive: 1 },
    { unique: true, partialFilterExpression: { isActive: true } }
);

export const UserMarketAssignment = mongoose.model<IUserMarketAssignment>('UserMarketAssignment', userMarketAssignmentSchema); 