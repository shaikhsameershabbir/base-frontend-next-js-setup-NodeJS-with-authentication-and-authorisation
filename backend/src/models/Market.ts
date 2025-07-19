import { Schema, model, Document } from 'mongoose';

export interface IMarket extends Document {
    marketName: string;
    openTime: string;
    closeTime: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const marketSchema = new Schema<IMarket>({
    marketName: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    openTime: {
        type: String,
        required: true
    },
    closeTime: {
        type: String,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
}, { timestamps: true });

export const Market = model<IMarket>('Market', marketSchema); 