import {  Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../../../models/User';
import { TokenBlacklist } from '../../../models/TokenBlacklist';
import { logger } from '../../../config/logger';

export class PlayerAuthMiddleware {
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async authenticatePlayer(req: any, res: Response, next: NextFunction): Promise<void> {
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

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

            // Ensure user is a player
            if (user.role !== 'player') {
                res.status(403).json({ success: false, message: 'Access denied. Player role required.' });
                return;
            }

            req.user = user;
            next();
        } catch (error) {
            logger.error('Player authentication error:', error);
            res.status(401).json({ success: false, message: 'Invalid token' });
        }
    }
} 