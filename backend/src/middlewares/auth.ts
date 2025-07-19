import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, extractTokenFromCookie } from '../utils/jwt';
import { User } from '../models/User';
import { TokenBlacklist } from '../models/TokenBlacklist';
import { logger } from '../config/logger';

// Define the user structure for authenticated requests
interface AuthenticatedUser {
    userId: string;
    username: string;
    balance: number;
    role: string;
    parentId?: string;
}

// Extend Request interface to include authenticated user and accessibleUserIds
export interface AuthenticatedRequest extends Omit<Request, 'user'> {
    user?: AuthenticatedUser;
    accessibleUserIds?: string[];
}

export const authenticateToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        // Extract token from cookie
        const token = extractTokenFromCookie(req.headers.cookie || '');

        if (!token) {
            res.status(401).json({
                success: false,
                message: 'Access token required'
            });
            return;
        }

        // Verify token
        const decoded = verifyAccessToken(token);

        // Check if token is blacklisted
        const isBlacklisted = await TokenBlacklist.findOne({ tokenId: decoded.jti });
        if (isBlacklisted) {
            res.status(401).json({
                success: false,
                message: 'Token has been revoked'
            });
            return;
        }

        // Check if user still exists and is active
        const user = await User.findById(decoded.userId);
        if (!user || !user.isActive) {
            res.status(401).json({
                success: false,
                message: 'User not found or inactive'
            });
            return;
        }

        // Attach user info to request with the correct structure
        (req as AuthenticatedRequest).user = {
            userId: String(user._id),
            username: user.username,
            balance: user.balance,
            role: user.role,
            parentId: user.parentId ? String(user.parentId) : undefined
        };
        next();

    } catch (error) {
        logger.error('Authentication error:', error);
        res.status(401).json({
            success: false,
            message: 'Invalid or expired token'
        });
    }
};

export const requireRole = (allowedRoles: string[]) => {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
            return;
        }

        if (!allowedRoles.includes(req.user.role)) {
            res.status(403).json({
                success: false,
                message: 'Insufficient permissions'
            });
            return;
        }

        next();
    };
};

