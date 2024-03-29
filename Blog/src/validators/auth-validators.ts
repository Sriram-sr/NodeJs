import { ValidationChain, body, oneOf, param } from 'express-validator';
import User from '../models/User';

export const signupReqValidator: ValidationChain[] = [
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

export const signinReqValidator = [
  oneOf(
    [
      body('email')
        .exists()
        .isEmail()
        .withMessage('Enter a valid email')
        .normalizeEmail(),
      body('username').exists().trim()
    ],
    {
      message: 'Atleast one of email or username should be provided',
      errorType: 'least_errored'
    }
  ),
  body('password').notEmpty().withMessage('Password is required').trim()
];

export const userIdValidator: ValidationChain = param('userId')
  .isMongoId()
  .withMessage('User is Id is not valid mongo Id');

export const updateProfileReqValidator: ValidationChain = body('about')
  .optional()
  .isLength({ max: 100 })
  .withMessage('About should not exceed 100 characters');

export const followReqValidator: ValidationChain = userIdValidator.custom(
  async (value: string, { req }) => {
    const validUser = await User.findById(value);
    if (!validUser) {
      throw new Error('User not found with this Id');
    }
    req.followUser = validUser;
  }
);
