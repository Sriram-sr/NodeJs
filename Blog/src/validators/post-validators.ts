import { ValidationChain, body } from 'express-validator';

export const createPostValidator: ValidationChain[] = [
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 100 })
    .withMessage('Title should not exceed 100 characters'),
  body('content')
    .notEmpty()
    .withMessage('Content is required')
    .isLength({ max: 1000 })
    .withMessage('Content should not exceed 1000 characters')
];
