import { Request, Response } from 'express';
import { User } from '../models/User';
import { generateToken, getCookieOptions } from '../utils/jwt';
import { logger } from '../config/logger';

export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const { username, password, balance, role, parentId } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ username });

        if (existingUser) {
            res.status(400).json({
                success: false,
                message: 'User with this username already exists'
            });
            return;
        }

        // Validate role hierarchy
        if (role !== 'superadmin' && !parentId) {
            res.status(400).json({
                success: false,
                message: 'Parent ID is required for non-superadmin roles'
            });
            return;
        }

        // Validate parent exists and has appropriate role
        if (parentId) {
            const parent = await User.findById(parentId);
            if (!parent) {
                res.status(400).json({
                    success: false,
                    message: 'Parent user not found'
                });
                return;
            }

            // Role hierarchy validation
            const validParentRoles = {
                'admin': ['superadmin'],
                'distributor': ['admin'],
                'player': ['distributor']
            };

            if (!validParentRoles[role as keyof typeof validParentRoles]?.includes(parent.role)) {
                res.status(400).json({
                    success: false,
                    message: `Invalid parent role. ${role} can only be created under ${validParentRoles[role as keyof typeof validParentRoles]?.join(' or ')}`
                });
                return;
            }
        }

        // Create new user
        const user = new User({
            username,
            password,
            balance: balance || 0,
            role: role || 'player',
            parentId
        });

        await user.save();

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

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user: userResponse
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
            parentId: user.parentId,
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

// Get users based on role hierarchy
export const getUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        const accessibleUserIds = (req as Request & { accessibleUserIds?: string[] }).accessibleUserIds;

        if (!accessibleUserIds || accessibleUserIds.length === 0) {
            res.json({
                success: true,
                data: { users: [] }
            });
            return;
        }

        const users = await User.find({
            _id: { $in: accessibleUserIds }
        }).select('-password').populate('parentId', 'username role');

        res.json({
            success: true,
            data: { users }
        });

    } catch (error) {
        logger.error('Get users error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Get user by ID (with access control)
export const getUserById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId } = req.params;
        const accessibleUserIds = (req as Request & { accessibleUserIds?: string[] }).accessibleUserIds;

        if (!accessibleUserIds || !accessibleUserIds.includes(userId)) {
            res.status(403).json({
                success: false,
                message: 'Access denied to this user'
            });
            return;
        }

        const user = await User.findById(userId).select('-password').populate('parentId', 'username role');

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
        logger.error('Get user by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Update user (with access control)
export const updateUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId } = req.params;
        const { username, balance, isActive } = req.body;
        const accessibleUserIds = (req as Request & { accessibleUserIds?: string[] }).accessibleUserIds;

        if (!accessibleUserIds || !accessibleUserIds.includes(userId)) {
            res.status(403).json({
                success: false,
                message: 'Access denied to this user'
            });
            return;
        }

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
        if (isActive !== undefined) user.isActive = isActive;

        await user.save();

        // Remove password from response
        const userResponse = {
            _id: user._id,
            username: user.username,
            balance: user.balance,
            role: user.role,
            parentId: user.parentId,
            isActive: user.isActive,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };

        res.json({
            success: true,
            message: 'User updated successfully',
            data: { user: userResponse }
        });

    } catch (error) {
        logger.error('Update user error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}; 