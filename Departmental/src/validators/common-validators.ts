import { ValidationChain, body, param, query } from 'express-validator';
import User from '../models/User';

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

export const updateOrderValidator: ValidationChain[] = [
  param('orderId')
    .isMongoId()
    .withMessage('Order Id should be a valid Mongo Id'),
  body('staff')
    .optional()
    .isMongoId()
    .withMessage('Staff should be a valid Mongo Id'),
  body('status')
    .optional()
    .isIn(['processing', 'shipped', 'delivered', 'cancelled'])
];

export const getTransactionsValidator: ValidationChain = query('mobile')
  .optional()
  .isLength({ min: 10, max: 10 })
  .withMessage('Mobile number should be 10 in length')
  .matches(/[6789]\d{9}/g)
  .withMessage('Enter a valid mobile number')
  .custom(async (value, { req }) => {
    const customer = await User.findOne({ mobile: value });
    if (!customer) {
      throw new Error('Customer not found with this mobile');
    }
    req.customer = customer._id;
  });
