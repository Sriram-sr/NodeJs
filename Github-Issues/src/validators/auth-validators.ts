import { ValidationChain, body, oneOf } from 'express-validator';
import User from '../models/User';

export const signupValidator: ValidationChain[] = [
  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Enter a valid email')
    .normalizeEmail()
    .custom(async value => {
      const existingUser = await User.findOne({ email: value });
      if (existingUser) {
        throw new Error('Email already exists');
      }
    }),
  body('username')
    .notEmpty()
    .withMessage('Username is required')
    .trim()
    .isLength({ min: 6, max: 15 })
    .withMessage('Username should not exceed 6 to 15 characters')
    .matches(/[a-z]+/g)
    .withMessage(
      'Username should contain only lowercase letters and not numbers'
    )
    .custom(async value => {
      const existingUser = await User.findOne({ username: value });
      if (existingUser) {
        throw new Error('Username is already taken');
      }
    }),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .trim()
    .isLength({ min: 6, max: 15 })
    .withMessage('Passoword should be atleast 6 to 15 characters')
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
        .withMessage(
          'Username should contain only letters and not numbers or any special characters'
        )
    ],
    {
      message: 'Atleast one of email or username is required',
      errorType: 'least_errored'
    }
  ),
  body('password').notEmpty().withMessage('Password is required').trim()
];
