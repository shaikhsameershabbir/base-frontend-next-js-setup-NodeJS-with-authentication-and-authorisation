// models/Activity.ts
import mongoose, { Document, Schema } from 'mongoose';

interface IActivity extends Document {
    userId: string;
    remarks: string;
    timestamp: Date;
    mutateTable: string;
    content_url?: string;
    file_size?: string;
    file_format?: string;
    status: boolean;
}

const activitySchema = new Schema<IActivity>({
    userId: { type: String, required: true },
    remarks: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    mutateTable: { type: String, required: true },
    content_url: { type: String, default: '' },
    file_size: { type: String, default: '' },
    file_format: { type: String, default: '' },
    status: { type: Boolean, required: true },
});

const Activity = mongoose.model<IActivity>('Activity', activitySchema);

export default Activity;
