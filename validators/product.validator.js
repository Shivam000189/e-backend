const { body } = require('express-validator');

exports.productValidator = [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be positive'),
    body('stock').isInt({ min: 0 }).withMessage('Stock must be non-negative'),
    body('categories').isArray({ min: 1 }).withMessage('At least one category required')
];

exports.updateProductValidator = [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('price').optional().isFloat({ min: 0 }).withMessage('Price must be positive'),
    body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be non-negative'),
    body('categories').optional().isArray({ min: 1 }).withMessage('At least one category required'),
    body('isActive').optional().isBoolean().withMessage('isActive must be true or false')
];

exports.stockValidator = [
    body('stock').isInt({ min: 0 }).withMessage('Stock must be non-negative')
];
