import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../../../models/User';
import { TokenBlacklist } from '../../../models/TokenBlacklist';
import { logger } from '../../../config/logger';

export class AuthMiddleware {
    async authenticateToken(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const authHeader = req.headers.authorization;
            const token = authHeader && authHeader.split(' ')[1];

            if (!token) {
                res.status(401).json({ success: false, message: 'Access token required' });
                return;
            }

            // Check if token is blacklisted
            const isBlacklisted = await TokenBlacklist.findOne({ token });
            if (isBlacklisted) {
                res.status(401).json({ success: false, message: 'Token has been invalidated' });
                return;
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
            const user = await User.findById(decoded.userId).select('-password');

            if (!user) {
                res.status(401).json({ success: false, message: 'User not found' });
                return;
            }

            if (!user.isActive) {
                res.status(401).json({ success: false, message: 'User account is deactivated' });
                return;
            }

            req.user = user;
            next();
        } catch (error) {
            logger.error('Authentication error:', error);
            res.status(401).json({ success: false, message: 'Invalid token' });
        }
    }

    requireRole(allowedRoles: string[]) {
        return (req: Request, res: Response, next: NextFunction): void => {
            if (!req.user) {
                res.status(401).json({ success: false, message: 'Authentication required' });
                return;
            }

            if (!allowedRoles.includes(req.user.role)) {
                res.status(403).json({ success: false, message: 'Insufficient permissions' });
                return;
            }

            next();
        };
    }

    async setAccessibleUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({ success: false, message: 'Authentication required' });
                return;
            }

            // Set accessible users based on role hierarchy
            let accessibleUserIds: string[] = [];

            switch (req.user.role) {
                case 'superadmin':
                    // Superadmin can access all users
                    const allUsers = await User.find({}).select('_id');
                    accessibleUserIds = allUsers.map((user: IUser) => (user._id as any).toString());
                    break;
                case 'admin':
                    // Admin can access users below them in hierarchy
                    accessibleUserIds = await this.getDownlineUserIds((req.user._id as any).toString());
                    break;
                case 'distributor':
                    // Distributor can access their direct downline
                    accessibleUserIds = await this.getDirectDownlineUserIds((req.user._id as any).toString());
                    break;
                case 'agent':
                    // Agent can access their direct downline
                    accessibleUserIds = await this.getDirectDownlineUserIds((req.user._id as any).toString());
                    break;
                default:
                    // Players can only access themselves
                    accessibleUserIds = [(req.user._id as any).toString()];
            }

            req.accessibleUserIds = accessibleUserIds;
            next();
        } catch (error) {
            logger.error('Error setting accessible users:', error);
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }

    private async getDownlineUserIds(userId: string): Promise<string[]> {
        // Implementation to get all users below in hierarchy
        // This would depend on your UserHierarchy model
        return [];
    }

    private async getDirectDownlineUserIds(userId: string): Promise<string[]> {
        // Implementation to get direct downline users
        // This would depend on your UserHierarchy model
        return [];
    }
} 