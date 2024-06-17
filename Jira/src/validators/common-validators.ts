import { ValidationChain, body } from 'express-validator';

export const createProjectValidator: ValidationChain[] = [
  body('projectCodePrefix')
    .notEmpty()
    .withMessage('Project code prefix is required')
    .isLength({ max: 2, min: 2 })
    .withMessage('Project code prefix should not exceed 2 characters')
    .isAlpha()
    .withMessage('Project code prefix should contain only letters')
    .toUpperCase(),
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 50 })
    .withMessage('Title should not exceed 50 characters'),
  body('description')
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ max: 500 })
    .withMessage('Description should not exceed 500 characters'),
  body('visibility')
    .notEmpty()
    .withMessage('Visibility is required')
    .isIn(['public', 'private'])
    .withMessage('Visibility should be either public or private')
];
