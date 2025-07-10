import { Request, Response } from 'express';
import { User } from '../../models/User';
import { generateTokenPair, getAccessTokenCookieOptions, getRefreshTokenCookieOptions } from '../../utils/jwt';
import { logger } from '../../config/logger';
import bcrypt from 'bcryptjs';

export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const { username, password, balance = 0, role = 'player', parentId } = req.body;

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

        // Create new user
        const user = new User({
            username,
            password,
            balance,
            role,
            parentId,
            isActive: true
        });

        await user.save();

        // Generate token pair
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
            message: 'User registered successfully',
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