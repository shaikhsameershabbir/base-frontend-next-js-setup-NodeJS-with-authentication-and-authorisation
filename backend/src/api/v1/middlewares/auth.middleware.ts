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

            let token: string | null = null;

            // First try to get token from Authorization header (Bearer token)
            const authHeader = req.headers.authorization;

            if (authHeader && authHeader.startsWith('Bearer ')) {
                try {
                    token = extractTokenFromHeader(authHeader);
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                } catch (error) {

                    // If Bearer token extraction fails, try cookie
                    token = extractTokenFromCookie(req.headers.cookie || '');
                }
            } else {
                // Fallback to cookie-based token
                token = extractTokenFromCookie(req.headers.cookie || '');
            }


            if (!token) {
                res.status(401).json({ success: false, message: 'Access token required' });
                return;
            }

            // Verify token using the same method as old middleware
            const decoded = verifyAccessToken(token);

            // Check if token is blacklisted
            const isBlacklisted = await TokenBlacklist.findOne({ tokenId: decoded.jti });
            if (isBlacklisted) {
                res.status(401).json({ success: false, message: 'Token has been revoked' });
                return;
            }

            // Check if user still exists and is active
            const user = await User.findById(decoded.userId);
            if (!user || !user.isActive) {
                res.status(401).json({ success: false, message: 'User not found or inactive' });
                return;
            }


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
            logger.error('Authentication error:', error);
            res.status(401).json({ success: false, message: 'Invalid or expired token' });
        }
    }

    requireRole(allowedRoles: string[]) {
        return (req: Request, res: Response, next: NextFunction): void => {
            const authReq = req as AuthenticatedRequest;
            if (!authReq.user) {
                res.status(401).json({ success: false, message: 'Authentication required' });
                return;
            }



            if (!allowedRoles.includes(authReq.user.role)) {
                res.status(403).json({ success: false, message: 'Insufficient permissions' });
                return;
            }

            next();
        };
    }






} 