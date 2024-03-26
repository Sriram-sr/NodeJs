import { ValidationChain, body, param } from 'express-validator';

export const postIdValidator: ValidationChain = param('postId')
  .isMongoId()
  .withMessage('Post Id is not a valid Mongo Id');

export const postContentValidator: ValidationChain = body('content')
  .notEmpty()
  .withMessage('Content is required')
  .isLength({ max: 1000 })
  .withMessage('Content should not exceed 1000 characters');

export const createPostValidator: ValidationChain[] = [
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 100 })
    .withMessage('Title should not exceed 100 characters'),
  postContentValidator
];
