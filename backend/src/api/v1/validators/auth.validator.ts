import { body } from 'express-validator';
import { ValidationMiddleware } from '../middlewares/validation.middleware';

export class AuthValidator {
    private validationMiddleware = new ValidationMiddleware();

    validateLogin = [
        body('username')
            .trim()
            .notEmpty()
            .withMessage('Username is required')
            .isLength({ min: 3, max: 50 })
            .withMessage('Username must be between 3 and 50 characters'),

        body('password')
            .trim()
            .notEmpty()
            .withMessage('Password is required')
            .isLength({ min: 6 })
            .withMessage('Password must be at least 6 characters long'),

        this.validationMiddleware.validateRequest
    ];

    validateRegister = [
        body('username')
            .trim()
            .notEmpty()
            .withMessage('Username is required')
            .isLength({ min: 3, max: 50 })
            .withMessage('Username must be between 3 and 50 characters')
            .matches(/^[a-zA-Z0-9_]+$/)
            .withMessage('Username can only contain letters, numbers, and underscores'),

        body('email')
            .optional()
            .trim()
            .isEmail()
            .withMessage('Invalid email format')
            .normalizeEmail(),

        body('password')
            .trim()
            .notEmpty()
            .withMessage('Password is required')
            .isLength({ min: 6 })
            .withMessage('Password must be at least 6 characters long')
            .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
            .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),

        body('role')
            .optional()
            .isIn(['superadmin', 'admin', 'distributor', 'agent', 'player'])
            .withMessage('Invalid role specified'),

        this.validationMiddleware.validateRequest
    ];

    validateRefreshToken = [
        body('refreshToken')
            .trim()
            .notEmpty()
            .withMessage('Refresh token is required'),

        this.validationMiddleware.validateRequest
    ];

    validateProfileUpdate = [
        body('email')
            .optional()
            .trim()
            .isEmail()
            .withMessage('Invalid email format')
            .normalizeEmail(),

        body('currentPassword')
            .optional()
            .trim()
            .notEmpty()
            .withMessage('Current password is required when updating password'),

        body('newPassword')
            .optional()
            .trim()
            .isLength({ min: 6 })
            .withMessage('New password must be at least 6 characters long')
            .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
            .withMessage('New password must contain at least one lowercase letter, one uppercase letter, and one number'),

        body()
            .custom((value, { req }) => {
                // If newPassword is provided, currentPassword must also be provided
                if (req.body.newPassword && !req.body.currentPassword) {
                    throw new Error('Current password is required when setting new password');
                }
                return true;
            }),

        this.validationMiddleware.validateRequest
    ];
} 