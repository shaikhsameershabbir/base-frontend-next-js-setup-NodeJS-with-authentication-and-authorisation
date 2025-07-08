import { Request, Response } from 'express';
import { User } from '../models/User';
import { generateToken } from '../utils/jwt';
import { logger } from '../config/logger';

export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const { username, password, balance, role } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ username });

        if (existingUser) {
            res.status(400).json({
                success: false,
                message: 'User with this username already exists'
            });
            return;
        }

        // Create new user
        const user = new User({
            username,
            password,
            balance: balance || 0,
            role: role || 'user'
        });

        await user.save();

        // Generate token
        const token = generateToken(user);

        // Remove password from response
        const userResponse = {
            _id: user._id,
            username: user.username,
            balance: user.balance,
            role: user.role,
            isActive: user.isActive,
            createdAt: user.createdAt
        };

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user: userResponse,
                token
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

export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            res.status(400).json({
                success: false,
                message: 'Username and password are required'
            });
            return;
        }

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

        // Verify password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
            return;
        }

        // Generate token
        const token = generateToken(user);

        // Remove password from response
        const userResponse = {
            _id: user._id,
            username: user.username,
            balance: user.balance,
            role: user.role,
            isActive: user.isActive,
            createdAt: user.createdAt
        };

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: userResponse,
                token
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

export const getProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = await User.findById(req.user?.userId).select('-password');

        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found'
            });
            return;
        }

        res.json({
            success: true,
            data: { user }
        });

    } catch (error) {
        logger.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        const { username, balance } = req.body;
        const userId = req.user?.userId;

        const user = await User.findById(userId);
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found'
            });
            return;
        }

        // Check if new username already exists
        if (username && username !== user.username) {
            const existingUser = await User.findOne({ username });
            if (existingUser) {
                res.status(400).json({
                    success: false,
                    message: 'Username already exists'
                });
                return;
            }
        }

        // Update user
        if (username) user.username = username;
        if (balance !== undefined) user.balance = balance;

        await user.save();

        // Remove password from response
        const userResponse = {
            _id: user._id,
            username: user.username,
            balance: user.balance,
            role: user.role,
            isActive: user.isActive,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: { user: userResponse }
        });

    } catch (error) {
        logger.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}; 