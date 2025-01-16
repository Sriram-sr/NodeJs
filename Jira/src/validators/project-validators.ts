import { body, param, ValidationChain } from 'express-validator';
import { Project } from '../models/Project';

const projectIdValidator: ValidationChain = param('projectId')
  .isMongoId()
  .withMessage('Provide a valid project ID')
  .custom(async (projectId: string, { req }) => {
    const project = await Project.findById(projectId);
    if (!project) {
      throw new Error('Project not found');
    }
    req.project = project;
  });

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

const requestToJoinValidator: ValidationChain = body('reason')
  .notEmpty()
  .withMessage('Reason is required')
  .isLength({ max: 200 })
  .withMessage('Reason should not exceed 200 characters');

const processJoinRequestValidator: ValidationChain = body('status')
  .notEmpty()
  .withMessage('Status is required')
  .isIn(['Approved', 'Declined'])
  .withMessage('Provide a valid status');

const createSprintValidator: ValidationChain[] = [
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 200 })
    .withMessage('Title should not exceed 200 characters'),
  body('startDate')
    .notEmpty()
    .withMessage('Start date is required')
    .isDate()
    .withMessage('Provide a valid date')
    .custom((startDate: Date) => {
      if (
        new Date(startDate).setHours(0, 0, 0, 0) <
        new Date().setHours(0, 0, 0, 0)
      ) {
        throw new Error('Start date should be greater than current date');
      }
      return true;
    }),
  body('endDate')
    .notEmpty()
    .withMessage('End date is required')
    .isDate()
    .withMessage('Provide a valid date')
    .custom((endDate: Date, { req }) => {
      if (new Date(endDate) <= new Date(req.body.startDate)) {
        throw new Error('End date should be greater than start date');
      }
      return true;
    }),
  body('goal')
    .notEmpty()
    .withMessage('Goal is required')
    .isLength({ max: 500 })
    .withMessage('Goal should not exceed 500 characters')
];

export {
  projectIdValidator,
  createProjectValidator,
  requestToJoinValidator,
  processJoinRequestValidator,
  createSprintValidator
};
