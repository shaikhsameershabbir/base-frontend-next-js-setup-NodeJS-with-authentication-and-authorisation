import { body, param } from 'express-validator';
import { ValidationMiddleware } from '../middlewares/validation.middleware';

export class UsersValidator {
    private validationMiddleware = new ValidationMiddleware();

    validateUserCreation = [
        body('username')
            .trim()
            .notEmpty()
            .withMessage('Username is required')
            .isLength({ min: 3, max: 50 })
            .withMessage('Username must be between 3 and 50 characters')
            .matches(/^[a-zA-Z0-9_]+$/)
            .withMessage('Username can only contain letters, numbers, and underscores'),
        body('password')
            .trim()
            .notEmpty()
            .withMessage('password is required')
            .isLength({ min: 6 })
            .withMessage('Password must be at least 6 characters long'),
            // .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
            // .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),

        this.validationMiddleware.validateRequest
    ];

    validateUserUpdate = [
        param('userId')
            .isMongoId()
            .withMessage('Invalid user ID format'),

        body('username')
            .optional()
            .trim()
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

        body('isActive')
            .optional()
            .isBoolean()
            .withMessage('isActive must be a boolean value'),

        this.validationMiddleware.validateRequest
    ];

    validatePasswordUpdate = [
        param('userId')
            .isMongoId()
            .withMessage('Invalid user ID format'),

        body('newPassword')
            .trim()
            .notEmpty()
            .withMessage('New password is required')
            .isLength({ min: 6 })
            .withMessage('Password must be at least 6 characters long')
            .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
            .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),

        this.validationMiddleware.validateRequest
    ];

    validateMarketAssignment = [
        param('userId')
            .isMongoId()
            .withMessage('Invalid user ID format'),

        body('marketIds')
            .isArray({ min: 1 })
            .withMessage('At least one market ID is required'),

        body('marketIds.*')
            .isMongoId()
            .withMessage('Invalid market ID format'),

        this.validationMiddleware.validateRequest
    ];

    validateMarketRemoval = [
        param('userId')
            .isMongoId()
            .withMessage('Invalid user ID format'),

        body('marketIds')
            .isArray({ min: 1 })
            .withMessage('At least one market ID is required'),

        body('marketIds.*')
            .isMongoId()
            .withMessage('Invalid market ID format'),

        this.validationMiddleware.validateRequest
    ];
} 