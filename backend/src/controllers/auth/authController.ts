import { Request, Response } from 'express';
import { User } from '../../models/User';
import { TokenBlacklist } from '../../models/TokenBlacklist';
import {
    generateTokenPair,
    generateAccessToken,
    verifyAccessToken,
    verifyRefreshToken,
    getAccessTokenCookieOptions,
    getRefreshTokenCookieOptions,
    getClearCookieOptions,
    extractTokenFromCookie,
    extractRefreshTokenFromCookie
} from '../../utils/jwt';
import { logger } from '../../config/logger';
import rateLimit from 'express-rate-limit';
import type { AuthenticatedRequest } from '../../middlewares/auth';
import { ActivityService } from '../../services/activityService';

// Rate limiting for login attempts
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 requests per windowMs
    message: {
        success: false,
        message: 'Too many login attempts, please try again later'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { username, password, login } = req.body;
        console.log('------------------------------------------------->>', username, password, login);
        
        // Input validation
        if (!username || !password) {
            res.status(400).json({
                success: false,
                message: 'Username and password are required'
            });
            return;
        }
        
        // Sanitize inputs
        const sanitizedUsername = username.trim().toLowerCase();
        const sanitizedPassword = password.trim();

        if (sanitizedUsername.length < 3 || sanitizedPassword.length < 6) {
            res.status(400).json({
                success: false,
                message: 'Invalid credentials format'
            });
            return;
        }
        
        // Find user by username (case-insensitive)
        const user = await User.findOne({
            username: { $regex: new RegExp(`^${sanitizedUsername}$`, 'i') }
        });
        
        console.log('------------------------------------------------->> Login success ', user);

        if (!user) {
            res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
            return;
        }

        // Check if user is active
        if (!user.isActive) {
            res.status(401).json({
                success: false,
                message: 'Account is deactivated. Please contact administrator.'
            });
            return;
        }
        
        // For web login, only allow players
        if (login === 'web' && user.role !== 'player') {
            res.status(403).json({
                success: false,
                message: 'Access denied. This login is only for players.'
            });
            return;
        }

        // Verify password
        console.log('Attempting password comparison...');
        const isPasswordValid = await user.comparePassword(sanitizedPassword);
        console.log('Password valid:', isPasswordValid);

        if (!isPasswordValid) {
            res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
            return;
        }

        // Generate token pair
        const tokenPair = generateTokenPair(user, login || 'web');

        // Set HTTP-only cookies
        res.cookie('authToken', tokenPair.accessToken, getAccessTokenCookieOptions());
        res.cookie('refreshToken', tokenPair.refreshToken, getRefreshTokenCookieOptions());

        // Remove sensitive data from response
        const userResponse = {
            _id: user._id,
            username: user.username,
            balance: user.balance,
            role: user.role,
            parentId: user.parentId,
            isActive: user.isActive,
            createdAt: user.createdAt

        };

        // Log successful login
        logger.info(`User ${user.username} logged in successfully`, {
            userId: user._id,
            role: user.role,
            ip: req.ip,
            userAgent: req.get('User-Agent')
        });

        // Get real IP address
        const realIp = req.headers['x-forwarded-for'] ||
            req.headers['x-real-ip'] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            req.ip ||
            'unknown';

        // Log activity
        try {
            await ActivityService.logLogin(
                String(user._id),
                Array.isArray(realIp) ? realIp[0] : String(realIp),
                req.get('User-Agent'),
                login // Pass the login parameter
            );
            // update last login
            user.lastLogin = new Date();
            user.loginSource = login || 'unknown';
            await user.save();
        } catch (activityError) {
            logger.error('Failed to log login activity:', activityError);
            // Don't fail the login if activity logging fails
        }

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: userResponse,
                tokenExpires: tokenPair.accessTokenExpires
            }
        });

    } catch (error) {
        logger.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const refresh = async (req: Request, res: Response): Promise<void> => {
    try {
        // Log incoming cookies for debugging
        logger.info('Refresh endpoint called. Incoming cookies:', { cookies: req.headers.cookie });

        // Extract refresh token from cookies
        const refreshToken = extractRefreshTokenFromCookie(req.headers.cookie || '');
        logger.info('Extracted refresh token:', { refreshToken });

        if (!refreshToken) {
            logger.warn('No refresh token found in cookies.');
            res.status(401).json({
                success: false,
                message: 'Refresh token required'
            });
            return;
        }

        // Verify refresh token
        let decoded;
        try {
            decoded = verifyRefreshToken(refreshToken);
        } catch (verifyError) {
            logger.error('Refresh token verification failed:', verifyError);
            res.status(401).json({
                success: false,
                message: 'Invalid refresh token (verification failed)'
            });
            return;
        }

        // Check if token is blacklisted
        const isBlacklisted = await TokenBlacklist.findOne({ tokenId: decoded.jti });
        if (isBlacklisted) {
            logger.warn('Refresh token is blacklisted.', { tokenId: decoded.jti });
            res.status(401).json({
                success: false,
                message: 'Token has been revoked'
            });
            return;
        }

        // Check if user still exists and is active
        const user = await User.findById(decoded.userId);
        if (!user || !user.isActive) {
            logger.warn('User not found or inactive during refresh.', { userId: decoded.userId });
            res.status(401).json({
                success: false,
                message: 'User not found or inactive'
            });
            return;
        }

        // Generate new access token
        const newAccessToken = generateAccessToken(user);

        // Set new access token cookie
        res.cookie('authToken', newAccessToken, getAccessTokenCookieOptions());

        res.json({
            success: true,
            message: 'Token refreshed successfully',
            data: {
                tokenExpires: decoded.exp
            }
        });

    } catch (error) {
        logger.error('Token refresh error (outer catch):', error);
        res.status(401).json({
            success: false,
            message: 'Invalid refresh token (outer catch)'
        });
    }
};

export const logout = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        // Extract tokens from cookies
        const accessToken = extractTokenFromCookie(req.headers.cookie || '');
        const refreshToken = extractRefreshTokenFromCookie(req.headers.cookie || '');

        // Blacklist both tokens if they exist
        if (accessToken) {
            try {
                const decoded = verifyAccessToken(accessToken);
                await TokenBlacklist.create({
                    tokenId: decoded.jti,
                    userId: decoded.userId,
                    expiresAt: new Date(decoded.exp! * 1000)
                });
            } catch (error) {
                logger.error('Logout error:', error);
                // Token might be expired, continue with logout
            }
        }

        if (refreshToken) {
            try {
                const decoded = verifyRefreshToken(refreshToken);
                await TokenBlacklist.create({
                    tokenId: decoded.jti,
                    userId: decoded.userId,
                    expiresAt: new Date(decoded.exp! * 1000)
                });
            } catch (error) {
                logger.error('Logout error:', error);
                // Token might be expired, continue with logout
            }
        }

        // Log logout activity
        if (req.user) {
            // Get real IP address
            const realIp = req.headers['x-forwarded-for'] ||
                req.headers['x-real-ip'] ||
                req.connection.remoteAddress ||
                req.socket.remoteAddress ||
                req.ip ||
                'unknown';

            try {
                await ActivityService.logLogout(
                    req.user.userId,
                    Array.isArray(realIp) ? realIp[0] : String(realIp)
                );
            } catch (activityError) {
                logger.error('Failed to log logout activity:', activityError);
                // Don't fail the logout if activity logging fails
            }
        }

        // Clear cookies
        res.clearCookie('authToken', getClearCookieOptions());
        res.clearCookie('refreshToken', getClearCookieOptions());

        res.json({
            success: true,
            message: 'Logout successful'
        });

    } catch (error) {
        logger.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const logoutAll = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
            return;
        }

        // Blacklist all tokens for this user
        await TokenBlacklist.updateMany(
            { userId: req.user.userId },
            { $set: { expiresAt: new Date() } }
        );

        // Clear cookies
        res.clearCookie('authToken', getClearCookieOptions());
        res.clearCookie('refreshToken', getClearCookieOptions());

        res.json({
            success: true,
            message: 'Logged out from all devices'
        });

    } catch (error) {
        logger.error('Logout all error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Export the rate limiter for use in routes
export { loginLimiter };

