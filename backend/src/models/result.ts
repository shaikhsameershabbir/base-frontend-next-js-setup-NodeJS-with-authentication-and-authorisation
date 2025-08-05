import { Schema, model, Document } from 'mongoose';

export interface IResult extends Document {
    marketId: object;
    declaredBy: object;
    totalWin: number;
    open: number | null;
    main: number | null;
    close: number | null;
    openDeclationTime: Date;
    closeDeclationTime: Date;
    createdAt: Date;
}

const resultSchema = new Schema<IResult>({
    marketId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Market',
    },


    declaredBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    totalWin: {
        type: Number,
        default: 0,
        required: true
    },
    open: {
        type: Number,
        default: null,
        required: false
    },
    main: {
        type: Number,
        default: null,
        required: false
    },
    close: {
        type: Number,
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
}, { timestamps: true });

export const Result = model<IResult>('Result', resultSchema); 