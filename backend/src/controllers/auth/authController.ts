import { Request, Response } from 'express';
import { User } from '../../models/User';
import { generateToken, getCookieOptions } from '../../utils/jwt';
import { logger } from '../../config/logger';



export const login = async (req: Request, res: Response): Promise<void> => {
    try {

        const { username, password } = req.body;
        console.log('--------------------------------->');

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

        // Set HTTP-only cookie
        res.cookie('authToken', token, getCookieOptions());

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

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: userResponse
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

export const logout = async (req: Request, res: Response): Promise<void> => {
    try {
        // Clear the auth cookie
        res.clearCookie('authToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
            path: '/',
            domain: process.env.COOKIE_DOMAIN || undefined
        });

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

