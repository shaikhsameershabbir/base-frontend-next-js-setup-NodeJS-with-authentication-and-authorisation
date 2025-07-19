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

        body('type')
            .trim()
            .notEmpty()
            .withMessage('Transfer type is required')
            .isIn(['credit', 'debit'])
            .withMessage('Transfer type must be either credit or debit'),

        body('reason')
            .trim()
            .notEmpty()
            .withMessage('Transfer reason is required')
            .isLength({ max: 500 })
            .withMessage('Reason must be less than 500 characters'),

        body('adminNote')
            .optional()
            .trim()
            .isLength({ max: 1000 })
            .withMessage('Admin note must be less than 1000 characters'),

        this.validationMiddleware.validateRequest
    ];
} 