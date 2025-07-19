import { body } from 'express-validator';
import { ValidationMiddleware } from '../middlewares/validation.middleware';

export class TransfersValidator {
    private validationMiddleware = new ValidationMiddleware();

    validateTransfer = [
        body('toUserId')
            .trim()
            .notEmpty()
            .withMessage('Recipient user ID is required')
            .isMongoId()
            .withMessage('Invalid user ID format'),

        body('amount')
            .isFloat({ min: 0.01 })
            .withMessage('Amount must be a positive number greater than 0'),

        body('description')
            .optional()
            .trim()
            .isLength({ max: 500 })
            .withMessage('Description must be less than 500 characters'),

        this.validationMiddleware.validateRequest
    ];
} 