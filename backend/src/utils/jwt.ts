import jwt, { SignOptions } from 'jsonwebtoken';
import { IUser } from '../models/User';
import type { StringValue } from 'ms';

const JWT_SECRET: jwt.Secret = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

export interface JWTPayload {
    userId: string;
    username: string;
    balance: number;
    role: string;
}

export const generateToken = (user: IUser): string => {
    const payload: JWTPayload = {
        userId: String(user._id),
        username: user.username,
        balance: user.balance,
        role: user.role
    };
    const options: SignOptions = { expiresIn: JWT_EXPIRES_IN as any };
    return jwt.sign(payload as object, JWT_SECRET, options);
};

export const verifyToken = (token: string): JWTPayload => {
    try {
        return jwt.verify(token, JWT_SECRET) as JWTPayload;
    } catch (error) {
        throw new Error('Invalid token');
    }
};

export const extractTokenFromHeader = (authHeader: string): string => {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new Error('Authorization header must start with Bearer');
    }

    return authHeader.substring(7);
}; 