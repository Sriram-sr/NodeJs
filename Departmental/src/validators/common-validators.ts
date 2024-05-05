import { ValidationChain, body } from 'express-validator';

export const addToCartValidator: ValidationChain[] = [
  body('price')
    .notEmpty()
    .withMessage('Price is required')
    .isInt()
    .withMessage('Price should be an integer value')
];
