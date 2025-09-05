import { Schema, model, Document } from 'mongoose';

// Interface for individual day result
interface DayResult {
    open: string | null;
    main: string | null;
    close: string | null;
    openDeclationTime: Date | null;
    closeDeclationTime: Date | null;
}

export interface IResult extends Document {
    marketId: object;
    marketName: string; // Human-readable market name for easier identification
    declaredBy: object | null;
    resultDate: Date; // Single date for the result
    results: DayResult;
    createdAt: Date;
    updatedAt: Date;
}

const dayResultSchema = new Schema<DayResult>({
    open: {
        type: String,
        default: null,
        required: false
    },
    main: {
        type: String,
        default: null,
        required: false
    },
    close: {
        type: String,
        default: null,
        required: false
    },
    openDeclationTime: {
        type: Date,
        default: null,
        required: false
    },
    closeDeclationTime: {
        type: Date,
        default: null,
        required: false
    }
}, { _id: false });

const resultSchema = new Schema<IResult>({
    marketId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Market',
    },
    marketName: {
        type: String,
        required: true,
        trim: true
    },
    declaredBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: false,
    },
    resultDate: {
        type: Date,
        required: true
    },
    results: {
        type: dayResultSchema,
        required: true
    }
}, { timestamps: true });

// Add unique compound index to prevent duplicate results for the same market and date
resultSchema.index({ marketId: 1, resultDate: 1 }, { unique: true });

export const Result = model<IResult>('Result', resultSchema); 