import { ValidationChain, body } from 'express-validator';

const emailValidator: ValidationChain = body('email')
  .notEmpty()
  .withMessage('Email is required')
  .isEmail()
  .withMessage('Enter a valid email')
  .normalizeEmail();

const passwordValidator: ValidationChain = body('password')
  .notEmpty()
  .withMessage('Password is required')
  .isLength({ max: 15, min: 6 })
  .withMessage('Password should not exceed 6 to 15 characters')
  .trim();

const signupValidator: ValidationChain[] = [emailValidator, passwordValidator];

const signinValidator: ValidationChain[] = [
  emailValidator,
  body('password').notEmpty().withMessage('Password is required').trim()
];

const resetPasswordValidator: ValidationChain[] = [
  body('token')
    .notEmpty()
    .withMessage('Token is required')
    .isLength({ max: 64, min: 64 })
    .withMessage('Token should be 64 characters in length'),
  passwordValidator
];

export {
  emailValidator,
  signupValidator,
  signinValidator,
  resetPasswordValidator
};
