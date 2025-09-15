import mongoose, { Document, Schema } from 'mongoose';

export interface ITransfer extends Document {
    fromUser: mongoose.Types.ObjectId;
    toUser: mongoose.Types.ObjectId;
    amount: number;
    type: 'credit' | 'debit';
    status: 'pending' | 'completed' | 'failed';
    reason: string;
    adminNote?: string;
    processedBy: mongoose.Types.ObjectId; // The user who processed the transfer
    fromUserBalanceBefore: number;
    fromUserBalanceAfter: number;
    toUserBalanceBefore: number;
    toUserBalanceAfter: number;
    createdAt: Date;
    updatedAt: Date;
    transactionType: string;
}

const transferSchema = new Schema<ITransfer>({
    fromUser: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    toUser: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    type: {
        type: String,
        enum: ['credit', 'debit'],
        required: true
    },
    transactionType: {
        type: String,
        required: false
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending'
    },
    reason: {
        type: String,
        required: false,
        trim: true,
        default: 'Manual transfer'
    },
    adminNote: {
        type: String,
        trim: true
    },
    processedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    fromUserBalanceBefore: {
        type: Number,
        required: true,
        min: 0
    },
    fromUserBalanceAfter: {
        type: Number,
        required: true,
        min: 0
    },
    toUserBalanceBefore: {
        type: Number,
        required: true,
        min: 0
    },
    toUserBalanceAfter: {
        type: Number,
        required: true,
        min: 0
    }
}, {
    timestamps: true
});

// Indexes for efficient queries
transferSchema.index({ fromUser: 1, createdAt: -1 });
transferSchema.index({ toUser: 1, createdAt: -1 });
transferSchema.index({ processedBy: 1, createdAt: -1 });
transferSchema.index({ status: 1 });
transferSchema.index({ type: 1 });

export const Transfer = mongoose.model<ITransfer>('Transfer', transferSchema); 