import { body } from 'express-validator';
import { ValidationMiddleware } from '../middlewares/validation.middleware';

export class PlayerValidator {
    private validationMiddleware = new ValidationMiddleware();

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

    validatePlaceBet = [
        body('marketId')
            .trim()
            .notEmpty()
            .withMessage('Market ID is required')
            .isMongoId()
            .withMessage('Invalid market ID format'),

        body('gameType')
            .trim()
            .notEmpty()
            .withMessage('Game type is required')
            .isIn(['single', 'jodi', 'panna', 'sangam'])
            .withMessage('Invalid game type'),

        body('numbers')
            .isObject()
            .withMessage('Numbers must be an object')
            .custom((value) => {
                // Check if numbers object has at least one non-zero value
                const hasValidNumbers = Object.values(value).some((val: unknown) => typeof val === 'number' && val > 0);
                if (!hasValidNumbers) {
                    throw new Error('At least one number must have a bet amount greater than 0');
                }
                return true;
            }),

        body('amount')
            .isFloat({ min: 1 })
            .withMessage('Amount must be at least 1'),

        this.validationMiddleware.validateRequest
    ];

    validateBidConfirmation = [
        body('marketId')
            .trim()
            .notEmpty()
            .withMessage('Market ID is required')
            .isMongoId()
            .withMessage('Invalid market ID format'),

        body('gameType')
            .trim()
            .notEmpty()
            .withMessage('Game type is required')
            .isIn(['single', 'jodi', 'panna', 'sangam'])
            .withMessage('Invalid game type'),

        body('numbers')
            .isArray({ min: 1 })
            .withMessage('At least one number is required'),

        body('numbers.*')
            .isInt({ min: 0, max: 999 })
            .withMessage('Numbers must be between 0 and 999'),

        body('amount')
            .isFloat({ min: 1 })
            .withMessage('Amount must be at least 1'),

        this.validationMiddleware.validateRequest
    ];
} 