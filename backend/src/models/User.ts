import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
    username: string;
    password: string;
    balance: number;
    role: 'superadmin' | 'admin' | 'distributor' | 'agent' | 'player';
    parentId?: mongoose.Types.ObjectId; // Reference to parent user (admin for distributor, distributor for player)
    percentage: number; // Percentage from 0 to 100
    isActive: boolean;
    loginSource: string;
    lastLogin: Date;
    createdAt: Date;
    updatedAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 30
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    balance: {
        type: Number,
        default: 0,
        min: 0
    },
    role: {
        type: String,
        enum: ['superadmin', 'admin', 'distributor', 'agent', 'player'],
        default: 'player'
    },
    parentId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: function () {
            // parentId is required for all roles except superadmin
            return this.role !== 'superadmin';
        }
    },
    percentage: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    },
    loginSource: {
        type: String,
        default: 'unknown'
    },
    lastLogin: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for efficient queries
userSchema.index({ parentId: 1, role: 1 });
userSchema.index({ role: 1 });

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error as Error);
    }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<IUser>('User', userSchema); 