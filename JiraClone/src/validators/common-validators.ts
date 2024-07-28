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

export { signupValidator, signinValidator };
