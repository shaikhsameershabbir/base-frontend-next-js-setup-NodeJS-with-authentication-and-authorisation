import { body, param } from 'express-validator';
import { ValidationMiddleware } from '../middlewares/validation.middleware';

export class MarketsValidator {
    private validationMiddleware = new ValidationMiddleware();

    validateMarketCreation = [
        body('marketName')
            .trim()
            .notEmpty()
            .withMessage('Market name is required')
            .isLength({ min: 2, max: 100 })
            .withMessage('Market name must be between 2 and 100 characters'),
        body('openTime')
            .trim()
            .notEmpty()
            .withMessage('Open Time is required')
            .isLength({ min: 2, max: 100 })
            .withMessage('Market name must be between 2 and 100 characters'),
        body('closeTime')
            .trim()
            .notEmpty()
            .withMessage('Close Time is required')
            .isLength({ min: 2, max: 100 })
            .withMessage('Market name must be between 2 and 100 characters'),

        this.validationMiddleware.validateRequest
    ];

    validateMarketUpdate = [
        param('id')
            .isMongoId()
            .withMessage('Invalid market ID format'),

        body('name')
            .optional()
            .trim()
            .isLength({ min: 2, max: 100 })
            .withMessage('Market name must be between 2 and 100 characters'),

        body('status')
            .optional()
            .isIn(['open', 'closed', 'suspended'])
            .withMessage('Invalid market status'),

        this.validationMiddleware.validateRequest
    ];

    validateStatusUpdate = [
        param('id')
            .isMongoId()
            .withMessage('Invalid market ID format'),

        body('status')
            .trim()
            .notEmpty()
            .withMessage('Status is required')
            .isIn(['open', 'closed', 'suspended'])
            .withMessage('Invalid market status'),

        this.validationMiddleware.validateRequest
    ];
} 