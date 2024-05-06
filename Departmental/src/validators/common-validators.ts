import { ValidationChain, body } from 'express-validator';

export const addToCartValidator: ValidationChain[] = [
  body('price')
    .notEmpty()
    .withMessage('Price is required')
    .isInt()
    .withMessage('Price should be an integer value')
];

export const createOrderValidator: ValidationChain[] = [
  body('houseNo').notEmpty().withMessage('House number is required').trim(),
  body('street').notEmpty().withMessage('Street is required').trim(),
  body('city').notEmpty().withMessage('City is required').trim(),
  body('zip')
    .notEmpty()
    .withMessage('Zip code is required')
    .isNumeric()
    .withMessage('Zip code must be a number')
    .trim()
    .isLength({ min: 6, max: 6 })
    .withMessage('Zip code must be 6 digits'),
  body('landmark').optional().trim()
];
