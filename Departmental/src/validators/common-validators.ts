import { ValidationChain, body } from 'express-validator';
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
