import { body, ValidationChain } from 'express-validator';

const emailValidator: ValidationChain = body('email')
  .notEmpty()
  .withMessage('Email is required')
  .isEmail()
  .withMessage('Enter a valid email')
  .normalizeEmail();

const signupValidator: ValidationChain[] = [
  emailValidator,
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .trim()
    .isLength({ min: 6, max: 15 })
    .withMessage('Password should not exceed 6 to 15 characters')
];

const signinValidator: ValidationChain[] = [
  emailValidator,
  body('password').notEmpty().withMessage('Password is required').trim()
];

const createProjectValidator: ValidationChain[] = [
  body('projectCodePrefix')
    .notEmpty()
    .withMessage('Project prefix is required')
    .custom((value: string, { req }) => {
      if (!(value.trim().length === 2)) {
        throw new Error('Project prefix should be exactly 2 characters');
      }
      req.projectPrefix = value.trim().toUpperCase();
      return true;
    })
    .isLength({ max: 2, min: 2 })
    .withMessage('Project prefix should be exactly 2 characters'),
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 100 })
    .withMessage('Title should not exceed 100 characters'),
  body('description')
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 1000 })
    .withMessage('Title should not exceed 1000 characters'),
  body('visibility')
    .notEmpty()
    .withMessage('Visibility is required')
    .isIn(['public', 'private'])
    .withMessage('Enter a valid field for visibility')
];

export { signupValidator, signinValidator, createProjectValidator };
