import { Request, Response } from 'express';
import { User } from '../../models/User';
import { generateToken, getCookieOptions } from '../../utils/jwt';
import { logger } from '../../config/logger';
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