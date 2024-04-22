import { ValidationChain, body, param, query } from 'express-validator';
import Category from '../models/Category';

export const addProductValidator: ValidationChain[] = [
  body('productName')
    .notEmpty()
    .withMessage('Product name is required')
    .isLength({ min: 5, max: 50 })
    .withMessage('Product name should not exceed 5 to 50 characters'),
  body('description')
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ max: 500 })
    .withMessage('Description should not exceed 500 characters'),
  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .isMongoId()
    .withMessage('Category should be a mongo Id')
    .custom(async (categoryId: string, { req }) => {
      const validCategory = await Category.findById(categoryId);
      if (!validCategory) {
        throw new Error('Enter a valid category Id');
      }
      req.category = validCategory;
    }),
  body('unit')
    .notEmpty()
    .withMessage('Product unit is required')
    .isIn(['litres', 'kilograms', 'number'])
    .withMessage('Enter a valid unit'),
  body('unitsLeft')
    .notEmpty()
    .withMessage('Units left is required')
    .isNumeric()
    .withMessage('Units left value should be an integer'),
  body('price')
    .notEmpty()
    .withMessage('Price is required')
    .isInt()
    .withMessage('Price should be an integer'),
  body('expiryDate')
    .notEmpty()
    .withMessage('Expiry date is required')
    .isDate()
    .withMessage('Enter a valid date')
];

export const productIdValidator: ValidationChain = param('productId')
  .isMongoId()
  .withMessage('Enter a valid Mongo Id');

export const updateProductvalidator: ValidationChain[] = [
  body('productName')
    .optional()
    .isLength({ min: 5, max: 50 })
    .withMessage('Product name should not exceed 5 to 50 characters'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description should not exceed 500 characters'),
  body('category')
    .optional()
    .isMongoId()
    .withMessage('Category should be a mongo Id')
    .custom(async (categoryId: string, { req }) => {
      const validCategory = await Category.findById(categoryId);
      if (!validCategory) {
        throw new Error('Enter a valid category Id');
      }
      req.category = validCategory;
    }),
  body('unit')
    .optional()
    .isIn(['litres', 'kilograms', 'number'])
    .withMessage('Enter a valid unit'),
  body('unitsLeft')
    .optional()
    .isNumeric()
    .withMessage('Units left value should be an integer'),
  body('price').optional().isInt().withMessage('Price should be an integer'),
  body('expiryDate').optional().isDate().withMessage('Enter a valid date')
];

export const getProductsValidator: ValidationChain[] = [
  query('productName')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Product name should not exceed 50 characters'),
  query('unitsStart')
    .optional()
    .isInt()
    .withMessage('Units left start value should be a integer'),
  query('unitsEnd')
    .optional()
    .isInt()
    .withMessage('Units left end value should be a integer'),
  query('priceStart')
    .optional()
    .isInt()
    .withMessage('Price start value should be an integer'),
  query('priceEnd')
    .optional()
    .isInt()
    .withMessage('Price end value should be an integer'),
  query('ratingStart')
    .optional()
    .isInt({ max: 4, min: 1 })
    .withMessage(
      'Rating start value should be an integer within 0.1 to 4 only'
    ),
  query('ratingEnd')
    .optional()
    .isInt({ max: 5, min: 1 })
    .withMessage('Rating start value should be an integer within 1 to 5 only')
];

export const billTransactionValidator: ValidationChain[] = [
  body('items')
    .notEmpty()
    .withMessage('Items is required')
    .isArray()
    .withMessage('Items should be an array'),
  body('items.*.product')
    .notEmpty()
    .withMessage('Product is required in a item')
    .isMongoId()
    .withMessage('Product should be a valid Mongo Id'),
  body('items.*.qty')
    .notEmpty()
    .withMessage('Qty is required in a item')
    .isInt()
    .withMessage('Quantity should be an integer'),
  body('items.*.price')
    .notEmpty()
    .withMessage('Price is required in a item')
    .isInt()
    .withMessage('Price should be an integer'),
  body('customer')
    .notEmpty()
    .withMessage('Customer is required')
    .isMongoId()
    .withMessage('Customer should be a valid Mongo Id')
];
