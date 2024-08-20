import { body, ValidationChain } from 'express-validator';

const emailValidator: ValidationChain = body('email')
  .notEmpty()
  .withMessage('Email is required')
  .isEmail()
  .withMessage('Enter a valid email')
  .normalizeEmail();

const passwordValidator: ValidationChain = body('password')
  .notEmpty()
  .withMessage('Password is required')
  .trim()
  .isLength({ min: 6, max: 15 })
  .withMessage('Password should not exceed 6 to 15 characters');

const signupValidator: ValidationChain[] = [emailValidator, passwordValidator];

const signinValidator: ValidationChain[] = [
  emailValidator,
  body('password').notEmpty().withMessage('Password is required').trim()
];

const resetPasswordValidator: ValidationChain[] = [
  passwordValidator,
  body('token').notEmpty().withMessage('Token is required')
];

export {
  emailValidator,
  signupValidator,
  signinValidator,
  resetPasswordValidator
};
