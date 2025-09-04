import { Schema, model, Document } from 'mongoose';

export interface IMarket extends Document {
    marketName: string;
    openTime: string;
    closeTime: string;
    isActive: boolean;
    isGolden: boolean;
    autoResult: boolean;
    weekDays: number;
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
    isGolden: {
        type: Boolean,
        default: false
    },
    autoResult: {
        type: Boolean,
        default: true
    },
    weekDays: {
        type: Number,
        required: true,
        default: 7,
        min: 1,
        max: 7,
        validate: {
            validator: function (weekDays: number) {
                return weekDays >= 1 && weekDays <= 7;
            },
            message: 'WeekDays must be a number between 1 and 7'
        }
    },
}, { timestamps: true });

export const Market = model<IMarket>('Market', marketSchema); 