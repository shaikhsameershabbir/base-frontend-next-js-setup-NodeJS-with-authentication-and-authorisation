import mongoose, { Schema, Document, ObjectId } from 'mongoose';

export interface IUser extends Document {
    userId: number;
    role: 'user' | 'superuser' | 'restaurent';
    userName: string;
    email: string;
    password: string;
    contactNumber?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

const UserSchema: Schema = new Schema(
    {
        userId: { type: Number, required: true, unique: true },
        role: { type: String, enum: ['user', 'superuser', 'restaurent'], default: 'user' },
        userName: { type: String, required: true },
        email: { type: String, required: true, match: /^\S+@\S+\.\S+$/ },
        password: { type: String, required: true },
        contactNumber: { type: String, match: /^[0-9]{10,20}$/ },
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model<IUser>('UserModal', UserSchema);
