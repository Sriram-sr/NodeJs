import { ValidationChain, body } from 'express-validator';

const createProjectValidator: ValidationChain[] = [
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

const joinRequestValidator: ValidationChain[] = [
  body('projectId')
    .notEmpty()
    .withMessage('Project Id is required')
    .isMongoId()
    .withMessage('Project Id should be valid Mongo Id'),
  body('reason')
    .notEmpty()
    .withMessage('Reason is required')
    .isLength({ max: 150 })
    .withMessage('Reason should not exceed 150 characters')
];

const approveRequestValidator: ValidationChain[] = [
  body('projectId')
    .notEmpty()
    .withMessage('Project Id is required')
    .isMongoId()
    .withMessage('Project Id should be valid Mongo Id'),
  body('requester')
    .notEmpty()
    .withMessage('Requester is required')
    .isMongoId()
    .withMessage('Requester should be valid Mongo Id'),
  body('action')
    .notEmpty()
    .withMessage('Action is required')
    .isIn(['Approve', 'Decline'])
    .withMessage('Enter a valid action')
];

export {
  createProjectValidator,
  joinRequestValidator,
  approveRequestValidator
};
