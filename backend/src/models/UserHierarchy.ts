import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IUserHierarchy extends Document {
    userId: mongoose.Types.ObjectId;
    username: string;
    role: 'superadmin' | 'admin' | 'distributor' | 'agent' | 'player';
    parentId?: mongoose.Types.ObjectId;
    parentUsername?: string;
    parentRole?: string;
    path: mongoose.Types.ObjectId[]; // Array of ancestor IDs for efficient querying
    level: number; // Hierarchy level (0 = superadmin, 1 = admin, etc.)
    downlineCount: {
        admin: number;
        distributor: number;
        agent: number;
        player: number;
    };
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    updateDownlineCounts(): Promise<void>;
}

interface IUserHierarchyModel extends Model<IUserHierarchy> {
    findDownline(
        userId: mongoose.Types.ObjectId,
        role?: string,
        limit?: number,
        skip?: number
    ): Promise<IUserHierarchy[]>;
    findDirectDownline(
        userId: mongoose.Types.ObjectId,
        role?: string
    ): Promise<IUserHierarchy[]>;
    getDownlineStats(
        userId: mongoose.Types.ObjectId
    ): Promise<Record<string, { count: number; totalBalance: number }> | null>;
}

const userHierarchySchema = new Schema<IUserHierarchy>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    username: {
        type: String,
        required: true,
        index: true
    },
    role: {
        type: String,
        enum: ['superadmin', 'admin', 'distributor', 'agent', 'player'],
        required: true,
        index: true
    },
    parentId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        index: true
    },
    parentUsername: String,
    parentRole: String,
    path: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    level: {
        type: Number,
        required: true,
        index: true
    },
    downlineCount: {
        admin: { type: Number, default: 0 },
        distributor: { type: Number, default: 0 },
        agent: { type: Number, default: 0 },
        player: { type: Number, default: 0 }
    },
    isActive: {
        type: Boolean,
        default: true,
        index: true
    }
}, {
    timestamps: true
});

// Indexes for efficient querying
userHierarchySchema.index({ path: 1 });
userHierarchySchema.index({ parentId: 1, role: 1 });
userHierarchySchema.index({ level: 1, role: 1 });

// Static methods for hierarchy operations
userHierarchySchema.statics.findDownline = async function (
    userId: mongoose.Types.ObjectId,
    role?: string,
    limit = 50,
    skip = 0
) {
    const hierarchy = await this.findOne({ userId });
    if (!hierarchy) return [];

    const query: Record<string, unknown> = {
        path: { $in: [userId] },
        isActive: true
    };

    if (role) {
        query.role = role;
    }

    return this.find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .populate('userId', 'username balance role isActive createdAt');
};

userHierarchySchema.statics.findDirectDownline = async function (
    userId: mongoose.Types.ObjectId,
    role?: string
) {
    const query: Record<string, unknown> = {
        parentId: userId,
        isActive: true
    };

    if (role) {
        query.role = role;
    }

    return this.find(query)
        .populate('userId', 'username balance role isActive createdAt');
};

userHierarchySchema.statics.getDownlineStats = async function (
    userId: mongoose.Types.ObjectId
) {
    const hierarchy = await this.findOne({ userId });
    if (!hierarchy) return null;

    const stats = await this.aggregate([
        {
            $match: {
                path: { $in: [userId] },
                isActive: true
            }
        },
        {
            $group: {
                _id: '$role',
                count: { $sum: 1 },
                totalBalance: { $sum: '$balance' }
            }
        }
    ]);

    return stats.reduce((acc, stat) => {
        acc[stat._id] = {
            count: stat.count,
            totalBalance: stat.totalBalance
        };
        return acc;
    }, {});
};

// Instance methods
userHierarchySchema.methods.updateDownlineCounts = async function () {
    const model = this.constructor as Model<IUserHierarchy>;
    const counts = await model.aggregate([
        {
            $match: {
                path: { $in: [this.userId] },
                isActive: true
            }
        },
        {
            $group: {
                _id: '$role',
                count: { $sum: 1 }
            }
        }
    ]);

    const downlineCount = {
        admin: 0,
        distributor: 0,
        agent: 0,
        player: 0
    };

    counts.forEach((count: { _id: string; count: number }) => {
        downlineCount[count._id as keyof typeof downlineCount] = count.count;
    });

    this.downlineCount = downlineCount;
    await this.save();
};

export const UserHierarchy = mongoose.model<IUserHierarchy, IUserHierarchyModel>('UserHierarchy', userHierarchySchema); 