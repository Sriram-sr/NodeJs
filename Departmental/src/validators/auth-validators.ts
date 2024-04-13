import { ValidationChain, body, oneOf } from 'express-validator';

export const emailOrMobileValidator = oneOf(
  [
    body('email')
      .exists()
      .isEmail()
      .withMessage('Enter a valid email')
      .normalizeEmail(),
    body('mobile')
      .exists()
      .isLength({ min: 10, max: 10 })
      .withMessage('Mobile number should be 10 in length')
      .matches(/[6789]\d{9}/g)
      .withMessage('Enter a valid mobile number')
  ],
  {
    message: 'Atleast one of email or mobile is required',
    errorType: 'grouped'
  }
);

export const signupValidator: ValidationChain[] = [
  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Enter a valid email')
    .normalizeEmail(),
  body('mobile')
    .notEmpty()
    .withMessage('Mobile number is required')
    .isLength({ min: 10, max: 10 })
    .withMessage('Mobile number should be 10 in length')
    .matches(/[6789]\d{9}/g)
    .withMessage('Enter a valid mobile number'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6, max: 15 })
    .withMessage('Password should be atleast 6 to 15 characters'),
  body('role')
    .notEmpty()
    .withMessage('Role is required')
    .trim()
    .isIn(['admin', 'staff', 'customer'])
    .withMessage('Enter a valid role')
];

export const signinValidator = [
  emailOrMobileValidator,
  body('password').notEmpty().withMessage('Password is required').trim()
];

export const resetPasswordValidator: ValidationChain[] = [
  body('token').notEmpty().withMessage('Token is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6, max: 15 })
    .withMessage('Password should be atleast 6 to 15 characters')
];
