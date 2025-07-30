import { Response, NextFunction } from 'express';
import { verifyAccessToken, extractTokenFromCookie } from '../utils/jwt';
import { User } from '../models/User';
import { TokenBlacklist } from '../models/TokenBlacklist';
import { logger } from '../config/logger';
import { AuthenticatedRequest } from './auth';

// Extend Request interface to include user


export const authenticatePlayer = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        // Extract token from cookie or Authorization header
        let token = extractTokenFromCookie(req.headers.cookie || '');

        // Fallback to Authorization header if no cookie token
        if (!token) {
            const authHeader = req.headers.authorization;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                token = authHeader.substring(7);
            }
        }

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

        // Check if user is a player (only players can access these routes)
        if (user.role !== 'player') {
            res.status(403).json({
                success: false,
                message: 'Access denied. This route is only for players.'
            });
            return;
        }

        // Attach user info to request
        req.user = decoded;
        next();
    } catch (error) {
        logger.error('Player authentication error:', error);
        res.status(401).json({
            success: false,
            message: 'Invalid token'
        });
    }
};

/**
 * Middleware to check if user is a player (for optional routes)
 */
export const checkPlayerRole = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        // Extract token from cookie
        const token = extractTokenFromCookie(req.headers.cookie || '');

        if (!token) {
            // No token provided, continue without user info
            next();
            return;
        }

        // Verify token
        const decoded = verifyAccessToken(token);

        // Check if user still exists and is active
        const user = await User.findById(decoded.userId);
        if (user && user.isActive && user.role === 'player') {
            // Attach user info to request
            req.user = decoded;
        }

        next();
    } catch (error) {
        logger.error('Player authentication error:', error);
        // Token is invalid, continue without user info
        next();
    }
}; 