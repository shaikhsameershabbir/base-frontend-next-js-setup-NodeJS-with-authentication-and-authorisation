import mongoose, { Document, Schema } from 'mongoose';

export interface IUserHierarchy extends Document {
    userId: mongoose.Types.ObjectId;
    parentId?: mongoose.Types.ObjectId;
    path: mongoose.Types.ObjectId[]; // Array of ancestor IDs from root to parent
    level: number; // 0 for superadmin, 1 for admin, 2 for distributor, 3 for agent, 4 for player
    downlineCount: number; // Number of direct children
    totalDownlineCount: number; // Total number of users in downline (including children of children)
    createdAt: Date;
    updatedAt: Date;
}

const userHierarchySchema = new Schema<IUserHierarchy>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    parentId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    path: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    level: {
        type: Number,
        required: true,
        min: 0,
        max: 4
    },
    downlineCount: {
        type: Number,
        default: 0
    },
    totalDownlineCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Indexes for efficient queries
userHierarchySchema.index({ userId: 1 });
userHierarchySchema.index({ parentId: 1 });
userHierarchySchema.index({ path: 1 });
userHierarchySchema.index({ level: 1 });

export const UserHierarchy = mongoose.model<IUserHierarchy>('UserHierarchy', userHierarchySchema); 