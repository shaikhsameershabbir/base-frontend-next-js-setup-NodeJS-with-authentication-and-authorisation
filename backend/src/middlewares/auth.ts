import { Request, Response, NextFunction } from 'express';
import { verifyToken, extractTokenFromCookie } from '../utils/jwt';
import { User } from '../models/User';
import { logger } from '../config/logger';

// Extend Request interface to include user
declare global {
    namespace Express {
        interface Request {
            user?: {
                userId: string;
                username: string;
                balance: number;
                role: string;
                parentId?: string;
            };
        }
    }
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
        const decoded = verifyToken(token);

        // Check if user still exists and is active
        const user = await User.findById(decoded.userId);
        if (!user || !user.isActive) {
            res.status(401).json({
                success: false,
                message: 'User not found or inactive'
            });
            return;
        }

        // Attach user info to request
        req.user = decoded;
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
    return (req: Request, res: Response, next: NextFunction): void => {
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
export const setAccessibleUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
            case 'superadmin':
                // Superadmin can access all users
                const allUsers = await User.find({}).select('_id');
                accessibleUserIds = allUsers.map(user => String(user._id));
                break;

            case 'admin':
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

            case 'distributor':
                // Distributor can access players under them
                const distributorUsers = await User.find({
                    $or: [
                        { _id: req.user.userId },
                        { parentId: req.user.userId }
                    ]
                }).select('_id');
                accessibleUserIds = distributorUsers.map(user => String(user._id));
                break;

            case 'player':
                // Player can only access themselves
                accessibleUserIds = [req.user.userId];
                break;

            default:
                accessibleUserIds = [];
        }

        // Attach accessible user IDs to request
        (req as Request & { accessibleUserIds?: string[] }).accessibleUserIds = accessibleUserIds;
        next();

    } catch (error) {
        logger.error('Set accessible users error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}; 