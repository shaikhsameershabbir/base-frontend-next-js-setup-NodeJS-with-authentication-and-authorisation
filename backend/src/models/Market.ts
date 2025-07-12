import { Schema, model, Document } from 'mongoose';

export interface IMarket extends Document {
    marketName: string;
    openTime: Date;
    closeTime: Date;
    createdBy: string; // userId or username
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const marketSchema = new Schema<IMarket>({
    marketName: { type: String, required: true, unique: true },
    openTime: { type: Date, required: true },
    closeTime: { type: Date, required: true },
    createdBy: { type: String, required: true },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

export const Market = model<IMarket>('Market', marketSchema); 