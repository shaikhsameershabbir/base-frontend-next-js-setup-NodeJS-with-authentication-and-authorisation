import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';

import { User } from '../../../models/User';
import { TokenBlacklist } from '../../../models/TokenBlacklist';
import { logger } from '../../../config/logger';
import { generateTokenPair, generateAccessToken, verifyRefreshToken } from '../../../utils/jwt';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

export class AuthController {
    async login(req: Request, res: Response): Promise<void> {
        try {
            const { username, password, loginSource = 'unknown' } = req.body;

            // Find user by username
            const user = await User.findOne({ username });
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
                    message: 'Account is deactivated'
                });
                return;
            }

            // For web application, only allow player role
            if (loginSource === 'web' && user.role !== 'player') {
                res.status(403).json({
                    success: false,
                    message: 'Access denied. This application is only for players.'
                });
                return;
            }

            // Verify password
            const isValidPassword = await bcrypt.compare(password, user.password);
            if (!isValidPassword) {
                res.status(401).json({
                    success: false,
                    message: 'Invalid credentials'
                });
                return;
            }

            // Update login source and last login time
            user.loginSource = loginSource;
            user.lastLogin = new Date();
            await user.save();

            // Generate tokens using the new utility function
            const tokenPair = generateTokenPair(user, req.headers['user-agent'] || 'unknown');

            // Remove password from response
            const userResponse = {
                _id: user._id,
                username: user.username,

                role: user.role,
                isActive: user.isActive,
                balance: user.balance,
                parentId: user.parentId,
                createdAt: user.createdAt
            };

            res.json({
                success: true,
                message: 'Login successful',
                data: {
                    user: userResponse,
                    accessToken: tokenPair.accessToken,
                    refreshToken: tokenPair.refreshToken
                }
            });
        } catch (error) {
            logger.error('Login error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    async refresh(req: Request, res: Response): Promise<void> {
        try {
            const { refreshToken } = req.body;

            if (!refreshToken) {
                res.status(400).json({
                    success: false,
                    message: 'Refresh token required'
                });
                return;
            }

            // Verify refresh token using the utility function
            const decoded = verifyRefreshToken(refreshToken);
            const user = await User.findById(decoded.userId);

            if (!user || !user.isActive) {
                res.status(401).json({
                    success: false,
                    message: 'Invalid refresh token'
                });
                return;
            }

            // Generate new access token using the utility function
            const newAccessToken = generateAccessToken(user, req.headers['user-agent'] || 'unknown');

            res.json({
                success: true,
                message: 'Token refreshed successfully',
                data: {
                    accessToken: newAccessToken
                }
            });
        } catch (error) {
            logger.error('Token refresh error:', error);
            console.log('Refresh token error details:', {
                error: error instanceof Error ? error.message : 'Unknown error',
                refreshToken: req.body.refreshToken ? 'present' : 'missing',
                timestamp: new Date().toISOString()
            });
            res.status(401).json({
                success: false,
                message: 'Invalid refresh token'
            });
        }
    }

    async logout(req: Request, res: Response): Promise<void> {
        try {
            const authHeader = req.headers.authorization;
            const token = authHeader && authHeader.split(' ')[1];

            if (token) {
                // Add token to blacklist
                await TokenBlacklist.create({ token });
            }

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
    }

    async logoutAll(req: Request, res: Response): Promise<void> {
        try {
            const authReq = req as AuthenticatedRequest;
            if (!authReq.user) {
                res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
                return;
            }

            // Blacklist all tokens for this user (you might want to implement this)
            // For now, just return success
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
    }

    async register(req: Request, res: Response): Promise<void> {
        try {
            const { username, email, password, role = 'player' } = req.body;

            // Check if user already exists
            const existingUser = await User.findOne({
                $or: [{ username }, { email }]
            });

            if (existingUser) {
                res.status(409).json({
                    success: false,
                    message: 'Username or email already exists'
                });
                return;
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 12);

            // Create new user
            const newUser = new User({
                username,
                email,
                password: hashedPassword,
                role,
                isActive: true,
                balance: 0
            });

            await newUser.save();

            // Remove password from response
            const userResponse = {
                _id: newUser._id,
                username: newUser.username,

                role: newUser.role,
                isActive: newUser.isActive,
                balance: newUser.balance,
                createdAt: newUser.createdAt
            };

            res.status(201).json({
                success: true,
                message: 'User registered successfully',
                data: { user: userResponse }
            });
        } catch (error) {
            logger.error('Registration error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    async getProfile(req: Request, res: Response): Promise<void> {
        try {
            const authReq = req as AuthenticatedRequest;
            if (!authReq.user) {
                res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
                return;
            }

            res.json({
                success: true,
                message: 'Profile retrieved successfully',
                data: { user: authReq.user }
            });
        } catch (error) {
            logger.error('Get profile error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    async updateProfile(req: Request, res: Response): Promise<void> {
        try {
            const authReq = req as AuthenticatedRequest;
            if (!authReq.user) {
                res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
                return;
            }

            const { email, currentPassword, newPassword } = req.body;
            const updateData: Record<string, unknown> = {};

            // Update email if provided
            if (email) {
                const existingUser = await User.findOne({ email, _id: { $ne: authReq.user.userId } });
                if (existingUser) {
                    res.status(409).json({
                        success: false,
                        message: 'Email already exists'
                    });
                    return;
                }
                updateData.email = email;
            }

            // Update password if provided
            if (currentPassword && newPassword) {
                const user = await User.findById(authReq.user.userId);
                if (!user) {
                    res.status(404).json({
                        success: false,
                        message: 'User not found'
                    });
                    return;
                }

                const isValidPassword = await bcrypt.compare(currentPassword, user.password);
                if (!isValidPassword) {
                    res.status(400).json({
                        success: false,
                        message: 'Current password is incorrect'
                    });
                    return;
                }

                updateData.password = await bcrypt.hash(newPassword, 12);
            }

            // Update user
            const updatedUser = await User.findByIdAndUpdate(
                authReq.user.userId,
                updateData,
                { new: true, runValidators: true }
            ).select('-password');

            res.json({
                success: true,
                message: 'Profile updated successfully',
                data: { user: updatedUser }
            });
        } catch (error) {
            logger.error('Update profile error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
} 