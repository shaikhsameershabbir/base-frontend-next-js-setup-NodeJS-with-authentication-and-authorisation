import { Schema, model, Document } from 'mongoose';

export interface IBet extends Document {
    marketId: object;
    userId: object;
    type: string; // game type: single, double, panna, etc.
    betType: string; // bet type: open, close, both
    amount: number;
    userBeforeAmount: number;
    userAfterAmount: number;
    status: boolean;
    createdAt: Date;
    winAmount?: number | null;
    claimStatus?: boolean;
    result?: string;
    selectedNumbers: { [key: number]: number }; // Store the numbers and their amounts
    marketResult?: string; // Market result: open-main-close
    winnerBet: string | null; // Winner bet number
    winningMode: string | null; // Winning mode: auto, manualgit sta

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
        enum: ['open', 'close', 'both']
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
    },
    selectedNumbers: {
        type: Schema.Types.Mixed,
        required: true
    },
    winAmount: {
        type: Number,
        default: null
    },
    claimStatus: {
        type: Boolean,
        default: false
    },
    marketResult: {
        type: String,
        default: null
    },
    winnerBet: {
        type: String,
        default: null
    },
    winningMode: {
        type: String,
        enum: ['auto', 'manual'],
        default: null
    }
}, { timestamps: true });

export const Bet = model<IBet>('Bet', betSchema); 