import { ValidationChain, body } from 'express-validator';

export const addToCartValidator: ValidationChain[] = [
  body('productId')
    .notEmpty()
    .withMessage('Product Id is required')
    .isMongoId()
    .withMessage('Product Id should be a valid mongo Id'),
  body('price')
    .notEmpty()
    .withMessage('Price is required')
    .isInt()
    .withMessage('Price should be an integer value')
];
