import { Request, Response } from 'express';
import { User } from '../../models/User';
import { generateTokenPair, getAccessTokenCookieOptions, getRefreshTokenCookieOptions } from '../../utils/jwt';
import { logger } from '../../config/logger';

export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const { username, password, balance = 0 } = req.body;

        // Validate required fields
        if (!username || !password) {
            res.status(400).json({
                success: false,
                message: 'Username and password are required'
            });
            return;
        }

        // Check if username already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            res.status(400).json({
                success: false,
                message: 'Username already exists'
            });
            return;
        }

        // For public registration, only allow player role
        const role = 'player';

        // Create new user (player role, no parentId for public registration)
        const user = new User({
            username,
            password,
            balance,
            role,
            parentId: undefined, // Public registration users start without a parent
            isActive: true
        });

        await user.save();

        // Generate token pair for the new user
        const tokenPair = generateTokenPair(user);

        // Set HTTP-only cookies
        res.cookie('authToken', tokenPair.accessToken, getAccessTokenCookieOptions());
        res.cookie('refreshToken', tokenPair.refreshToken, getRefreshTokenCookieOptions());

        // Remove password from response
        const userResponse = {
            _id: user._id,
            username: user.username,
            balance: user.balance,
            role: user.role,
            parentId: user.parentId,
            isActive: user.isActive,
            createdAt: user.createdAt
        };

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            data: {
                user: userResponse,
                tokenExpires: tokenPair.accessTokenExpires
            }
        });

    } catch (error) {
        logger.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}; 