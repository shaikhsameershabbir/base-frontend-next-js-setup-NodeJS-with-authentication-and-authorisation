import { Request, Response, NextFunction } from 'express';
import { User } from '../../../models/User';
import { TokenBlacklist } from '../../../models/TokenBlacklist';
import { logger } from '../../../config/logger';
import { verifyAccessToken, extractTokenFromCookie, extractTokenFromHeader } from '../../../utils/jwt';

// Define the user structure for authenticated requests
export interface AuthenticatedUser {
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

export class AuthMiddleware {
    async authenticateToken(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {

            console.log('authenticateToken: Starting authentication check');
            let token: string | null = null;

            // First try to get token from Authorization header (Bearer token)
            const authHeader = req.headers.authorization;
            console.log('authenticateToken: Auth header:', authHeader);

            if (authHeader && authHeader.startsWith('Bearer ')) {
                try {
                    token = extractTokenFromHeader(authHeader);
                    console.log('authenticateToken: Token extracted from header');
                } catch (error) {

                    // If Bearer token extraction fails, try cookie
                    console.log('authenticateToken: Header extraction failed, trying cookie', error);
                    token = extractTokenFromCookie(req.headers.cookie || '');
                }
            } else {
                // Fallback to cookie-based token
                console.log('authenticateToken: No auth header, trying cookie');
                token = extractTokenFromCookie(req.headers.cookie || '');
            }

            console.log('authenticateToken: Token found:', !!token);

            if (!token) {
                console.log('authenticateToken: No token found');
                res.status(401).json({ success: false, message: 'Access token required' });
                return;
            }

            // Verify token using the same method as old middleware
            const decoded = verifyAccessToken(token);
            console.log('authenticateToken: Token verified, userId:', decoded.userId);

            // Check if token is blacklisted
            const isBlacklisted = await TokenBlacklist.findOne({ tokenId: decoded.jti });
            if (isBlacklisted) {
                console.log('authenticateToken: Token is blacklisted');
                res.status(401).json({ success: false, message: 'Token has been revoked' });
                return;
            }

            // Check if user still exists and is active
            const user = await User.findById(decoded.userId);
            if (!user || !user.isActive) {
                console.log('authenticateToken: User not found or inactive:', { found: !!user, active: user?.isActive });
                res.status(401).json({ success: false, message: 'User not found or inactive' });
                return;
            }

            console.log('authenticateToken: User authenticated successfully:', { userId: user._id, role: user.role });

            // Set user with the correct structure (same as old middleware)
            (req as AuthenticatedRequest).user = {
                userId: String(user._id),
                username: user.username,
                balance: user.balance,
                role: user.role,
                parentId: user.parentId ? String(user.parentId) : undefined
            };
            next();
        } catch (error) {
            console.log('authenticateToken: Error during authentication:', error);
            logger.error('Authentication error:', error);
            res.status(401).json({ success: false, message: 'Invalid or expired token' });
        }
    }

    requireRole(allowedRoles: string[]) {
        return (req: Request, res: Response, next: NextFunction): void => {
            const authReq = req as AuthenticatedRequest;
            if (!authReq.user) {
                console.log('requireRole: No user found in request');
                res.status(401).json({ success: false, message: 'Authentication required' });
                return;
            }

            console.log('requireRole check:', {
                userRole: authReq.user.role,
                allowedRoles: allowedRoles,
                hasPermission: allowedRoles.includes(authReq.user.role)
            });

            if (!allowedRoles.includes(authReq.user.role)) {
                console.log('requireRole: Access denied - user role not in allowed roles');
                res.status(403).json({ success: false, message: 'Insufficient permissions' });
                return;
            }

            console.log('requireRole: Access granted');
            next();
        };
    }

    async setAccessibleUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const authReq = req as AuthenticatedRequest;
            if (!authReq.user) {
                res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
                return;
            }

            let accessibleUserIds: string[] = [];

            switch (authReq.user.role) {
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
                            { _id: authReq.user.userId },
                            { parentId: authReq.user.userId },
                            {
                                parentId: {
                                    $in: await User.find({ parentId: authReq.user.userId }).select('_id').then(users => users.map(u => u._id))
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
                            { _id: authReq.user.userId },
                            { parentId: authReq.user.userId }
                        ]
                    }).select('_id');
                    accessibleUserIds = distributorUsers.map(user => String(user._id));
                    break;
                }

                case 'player': {
                    // Player can only access themselves
                    accessibleUserIds = [authReq.user.userId];
                    break;
                }

                default:
                    accessibleUserIds = [];
            }

            // Attach accessible user IDs to request
            authReq.accessibleUserIds = accessibleUserIds;

            // Debug logging
            logger.info(`User ${authReq.user.username} (${authReq.user.role}) can access ${accessibleUserIds.length} users`);
            logger.info(`Accessible user IDs: ${accessibleUserIds.join(', ')}`);

            next();

        } catch (error) {
            logger.error('Set accessible users error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }



    private async getDownlineUserIds(userId: string): Promise<string[]> {
        // Implementation to get all users below in hierarchy
        // This would depend on your UserHierarchy model
        console.log('Getting downline users for:', userId);
        return [];
    }

    private async getDirectDownlineUserIds(userId: string): Promise<string[]> {
        // Implementation to get direct downline users
        // This would depend on your UserHierarchy model
        console.log('Getting direct downline users for:', userId);
        return [];
    }
} 