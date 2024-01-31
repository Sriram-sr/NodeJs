import { ValidationChain, body, oneOf } from 'express-validator';
import User from '../models/User';

export const signupValidator: ValidationChain[] = [
  body('username')
    .notEmpty()
    .withMessage('Username is required')
    .isLength({ min: 6, max: 15 })
    .withMessage('Username should be within 6 to 15 characters')
    .matches(/^[a-zA-Z]+$/g)
    .withMessage('Username should contain only letters and not numbers')
    .custom(async value => {
      const existingUser = await User.findOne({ username: value });
      if (existingUser) {
        throw new Error('Username already taken');
      }
    }),
  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Enter a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6, max: 15 })
    .withMessage('Password should be within 6 to 15 characters')
    .matches(/[a-zA-Z]/g)
    .withMessage('Password should contain atleast one letter')
    .matches(/\d/g)
    .withMessage('Password should contain atleast one digit')
    .matches(/[~!@#$%^&*()<>_+=/]/g)
    .withMessage('Password should contain atleast one special character'),
  body('role')
    .notEmpty()
    .withMessage('Role is required')
    .isIn(['admin', 'customer'])
    .withMessage('Enter a valid role')
];

export const signinValidator = [
  oneOf(
    [
      body('email')
        .exists()
        .isEmail()
        .withMessage('Enter a valid email')
        .normalizeEmail(),
      body('username')
        .exists()
        .trim()
        .matches(/^[a-zA-Z]+$/g)
        .withMessage('Username should contain only letters and not numbers')
    ],
    {
      message: 'Atleast one of email or username is required',
      errorType: 'least_errored'
    }
  ),
  body('password').notEmpty().withMessage('Password is required').trim()
];
