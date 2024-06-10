import { ValidationChain, body } from 'express-validator';

const signupValidator: ValidationChain[] = [
  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Enter a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ max: 15, min: 6 })
    .withMessage('Password should not exceed 6 to 15 characters')
    .trim()
];

const signinValidator: ValidationChain[] = [
  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Enter a valid email')
    .normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required').trim()
];

export { signupValidator, signinValidator };
