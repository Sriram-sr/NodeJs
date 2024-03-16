import { ValidationChain, body } from 'express-validator';
import User from '../models/User';

export const signupValidator: ValidationChain[] = [
  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Enter a valid email')
    .normalizeEmail()
    .custom(async (value: string) => {
      const existingUser = await User.findOne({ email: value });
      if (existingUser) {
        throw new Error('User with this email already exists');
      }
    }),
  body('username')
    .notEmpty()
    .withMessage('Username is required')
    .trim()
    .matches(/\d{2}/g)
    .withMessage('Username should contain atleast two numbers')
    .isLength({ max: 15 })
    .withMessage('Username should not exceed 15 characters')
    .custom(async (value: string) => {
      const existingUser = await User.findOne({ username: value });
      if (existingUser) {
        throw new Error('Username is already taken');
      }
    }),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .trim()
    .isLength({ min: 5, max: 15 })
    .withMessage('Password should not exceed 5 to 15 characters')
];
