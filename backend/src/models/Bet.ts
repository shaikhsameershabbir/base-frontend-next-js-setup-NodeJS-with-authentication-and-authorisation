import { Schema, model, Document } from 'mongoose';

export interface IBet extends Document {
    marketId: object;
    userId: object;
    type: string; // game type: single, double, panna, etc.
    betType: string; // bet type: open, close
    amount: number;
    userBeforeAmount: number;
    userAfterAmount: number;
    status: boolean;
    createdAt: Date;
    result?: string;
}

const betSchema = new Schema<IBet>({
    marketId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Market',
    },
    type: {
        type: String,
        required: true
    },
    betType: {
        type: String,
        required: true,
        enum: ['open', 'close']
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        default: 0,
        required: true
    },
    userBeforeAmount: {
        type: Number,
        default: 0,
        required: true
    },
    userAfterAmount: {
        type: Number,
        default: 0,
        required: true
    },
    status: {
        type: Boolean,
        default: true
    },
    result: {
        type: String,
        default: null
    }
}, { timestamps: true });

export const Bet = model<IBet>('Bet', betSchema); 