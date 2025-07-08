import { Request, Response, NextFunction } from 'express';
import { verifyToken, extractTokenFromHeader, JWTPayload } from '../utils/jwt';
import { User } from '../models/User';

// Extend Express Request interface to include user
declare global {
    namespace Express {
        interface Request {
            user?: JWTPayload;
        }
    }
}

export const authenticateToken = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            res.status(401).json({
                success: false,
                message: 'Access token required'
            });
            return;
        }

        const token = extractTokenFromHeader(authHeader);
        const decoded = verifyToken(token);

        // Check if user still exists and is active
        const user = await User.findById(decoded.userId).select('-password');
        if (!user || !user.isActive) {
            res.status(401).json({
                success: false,
                message: 'User not found or inactive'
            });
            return;
        }

        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Invalid or expired token'
        });
    }
};

export const requireRole = (roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
            return;
        }

        if (!roles.includes(req.user.role)) {
            res.status(403).json({
                success: false,
                message: 'Insufficient permissions'
            });
            return;
        }

        next();
    };
}; 