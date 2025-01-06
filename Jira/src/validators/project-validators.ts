import { body, ValidationChain } from 'express-validator';

const createProjectValidator: ValidationChain[] = [
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 200 })
    .withMessage('Title should not exceed 200 characters'),
  body('description')
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ max: 500 })
    .withMessage('Description should not exceed 200 characters'),
  body('visibility')
    .notEmpty()
    .withMessage('Visibility is required')
    .isIn(['public', 'private'])
];

const projectRequestValidator: ValidationChain = body('reason')
  .notEmpty()
  .withMessage('Reason is required')
  .isLength({ max: 200 })
  .withMessage('Reason should not exceed 200 characters');

const processJoinRequestValidator: ValidationChain = body('status')
  .notEmpty()
  .withMessage('Status is required')
  .isIn(['Approved', 'Declined'])
  .withMessage('Provide a valid status');

export {
  createProjectValidator,
  projectRequestValidator,
  processJoinRequestValidator
};
