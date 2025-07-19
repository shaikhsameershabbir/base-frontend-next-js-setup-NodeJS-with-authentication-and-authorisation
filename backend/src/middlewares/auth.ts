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

// Middleware to determine accessible user IDs based on role hierarchy
export const setAccessibleUsers = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
            return;
        }

        let accessibleUserIds: string[] = [];

        switch (req.user.role) {
            case 'superadmin': {
                // Superadmin can access all users
                const allUsers = await User.find({}).select('_id');
                accessibleUserIds = allUsers.map(user => String(user._id));
                break;
            }

            case 'admin': {
                // Admin can access distributors and players under them
                const adminUsers = await User.find({
                    $or: [
                        { _id: req.user.userId },
                        { parentId: req.user.userId },
                        {
                            parentId: {
                                $in: await User.find({ parentId: req.user.userId }).select('_id').then(users => users.map(u => u._id))
                            }
                        }
                    ]
                }).select('_id');
                accessibleUserIds = adminUsers.map(user => String(user._id));
                break;
            }

            case 'distributor': {
                // Distributor can access players under them
                const distributorUsers = await User.find({
                    $or: [
                        { _id: req.user.userId },
                        { parentId: req.user.userId }
                    ]
                }).select('_id');
                accessibleUserIds = distributorUsers.map(user => String(user._id));
                break;
            }

            case 'player': {
                // Player can only access themselves
                accessibleUserIds = [req.user.userId];
                break;
            }

            default:
                accessibleUserIds = [];
        }

        // Attach accessible user IDs to request
        req.accessibleUserIds = accessibleUserIds;
        next();

    } catch (error) {
        logger.error('Set accessible users error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}; 