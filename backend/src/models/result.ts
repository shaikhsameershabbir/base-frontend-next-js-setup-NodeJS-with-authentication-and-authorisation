import { Schema, model, Document } from 'mongoose';

// Interface for individual day result
interface DayResult {
    open: string | null;
    main: string | null;
    close: string | null;
    openDeclationTime: Date | null;
    closeDeclationTime: Date | null;
}

// Interface for weekly result
interface WeeklyResult {
    monday?: DayResult;
    tuesday?: DayResult;
    wednesday?: DayResult;
    thursday?: DayResult;
    friday?: DayResult;
    saturday?: DayResult;
    sunday?: DayResult;
    [key: string]: DayResult | undefined;
}

export interface IResult extends Document {
    marketId: object;
    marketName: string; // Human-readable market name for easier identification
    declaredBy: object | null;
    weekStartDate: Date;
    weekEndDate: Date;
    weekDays: number; // Number of days in the week (5, 6, or 7)
    results: WeeklyResult;
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

const weeklyResultSchema = new Schema<WeeklyResult>({
    monday: dayResultSchema,
    tuesday: dayResultSchema,
    wednesday: dayResultSchema,
    thursday: dayResultSchema,
    friday: dayResultSchema,
    saturday: dayResultSchema,
    sunday: dayResultSchema
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
    weekStartDate: {
        type: Date,
        required: true
    },
    weekEndDate: {
        type: Date,
        required: true
    },
    weekDays: {
        type: Number,
        required: true,
        enum: [5, 6, 7],
        default: 7
    },
    results: {
        type: weeklyResultSchema,
        default: {}
    }
}, { timestamps: true });

// Add unique compound index to prevent duplicate results for the same market and week
resultSchema.index({ marketId: 1, weekStartDate: 1, weekEndDate: 1 }, { unique: true });

export const Result = model<IResult>('Result', resultSchema); 