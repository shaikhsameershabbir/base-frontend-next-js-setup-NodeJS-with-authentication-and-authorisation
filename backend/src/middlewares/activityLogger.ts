import { Response, NextFunction } from 'express';
import { ActivityService } from '../services/activityService';
import { logger } from '../config/logger';
import { AuthenticatedRequest } from '../api/v1/middlewares/auth.middleware';

interface ActivityLogConfig {
    activityType: 'login' | 'logout' | 'bid' | 'win' | 'transfer' | 'registration' | 'balance_update' | 'game_play' | 'market_action' | 'commission' | 'other';
    activityMessage: string;
    extractMetadata?: (req: AuthenticatedRequest, res: Response) => Record<string, unknown>;
}

/**
 * Middleware to automatically log activities
 */
export const logActivity = (config: ActivityLogConfig) => {
    return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        const originalSend = res.send;

        res.send = function (data) {
            // Restore original send
            res.send = originalSend;

            // Log activity after response is sent
            if (req.user && res.statusCode >= 200 && res.statusCode < 300) {
                try {
                    const metadata = config.extractMetadata ? config.extractMetadata(req, res) : {};

                    ActivityService.createActivity({
                        userId: req.user.userId,
                        activity: config.activityMessage,
                        activityType: config.activityType,
                        status: 'success',
                        metadata
                    }).catch(error => {
                        logger.error('Failed to log activity:', error);
                    });
                } catch (error) {
                    logger.error('Error in activity logging middleware:', error);
                }
            }

            // Call original send
            return originalSend.call(this, data);
        };

        next();
    };
};

/**
 * Middleware to log failed activities
 */
export const logFailedActivity = (config: ActivityLogConfig) => {
    return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        const originalSend = res.send;

        res.send = function (data) {
            // Restore original send
            res.send = originalSend;

            // Log failed activity
            if (req.user && res.statusCode >= 400) {
                try {
                    const metadata = config.extractMetadata ? config.extractMetadata(req, res) : {};

                    ActivityService.createActivity({
                        userId: req.user.userId,
                        activity: config.activityMessage,
                        activityType: config.activityType,
                        status: 'failed',
                        metadata: {
                            ...metadata,
                            statusCode: res.statusCode,
                            error: typeof data === 'string' ? data : JSON.stringify(data)
                        }
                    }).catch(error => {
                        logger.error('Failed to log failed activity:', error);
                    });
                } catch (error) {
                    logger.error('Error in failed activity logging middleware:', error);
                }
            }

            // Call original send
            return originalSend.call(this, data);
        };

        next();
    };
};

/**
 * Helper function to extract common metadata from requests
 */
export const extractCommonMetadata = (req: AuthenticatedRequest) => {
    // Get real IP address
    const realIp = req.headers['x-forwarded-for'] ||
        req.headers['x-real-ip'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.ip ||
        'unknown';

    return {
        ipAddress: Array.isArray(realIp) ? realIp[0] : String(realIp),
        userAgent: req.get('User-Agent'),
        method: req.method,
        path: req.path,
        timestamp: new Date().toISOString()
    };
}; 