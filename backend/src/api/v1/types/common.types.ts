import { Request } from 'express';
import { Document } from 'mongoose';
import { IUser } from '../../../models/User';

// Extend Express Request interface
declare global {
    namespace Express {
        interface Request {
            user?: IUser;
            accessibleUserIds?: string[];
        }
    }
}

// Common API Response types
export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    errors?: any[];
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

// Common query parameters
export interface PaginationQuery {
    page?: number;
    limit?: number;
    sort?: string;
    order?: 'asc' | 'desc';
}

export interface SearchQuery extends PaginationQuery {
    search?: string;
    filter?: string;
}

// User types
export interface UserDocument extends Document {
    _id: string;
    username: string;
    email?: string;
    role: 'superadmin' | 'admin' | 'distributor' | 'agent' | 'player';
    isActive: boolean;
    balance: number;
    createdAt: Date;
    updatedAt: Date;
}

// Market types
export interface MarketDocument extends Document {
    _id: string;
    name: string;
    status: 'open' | 'closed' | 'suspended';
    createdAt: Date;
    updatedAt: Date;
}

// Transfer types
export interface TransferDocument extends Document {
    _id: string;
    fromUser: string;
    toUser: string;
    amount: number;
    status: 'pending' | 'completed' | 'failed';
    createdAt: Date;
    updatedAt: Date;
}

// Activity types
export interface ActivityDocument extends Document {
    _id: string;
    user: string;
    action: string;
    details: any;
    ipAddress: string;
    userAgent: string;
    createdAt: Date;
} 