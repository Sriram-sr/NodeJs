import { ValidationChain, body, param } from 'express-validator';
import { User } from '../models/User';
import { Project } from '../models/Project';

export const projectCodeValidator: ValidationChain = param(
  'projectCode'
).custom(async (code: string, { req }) => {
  const codePrefix = code.slice(0, 2);
  if (codePrefix !== codePrefix.toUpperCase()) {
    throw new Error('Enter a valid project code');
  }
  const project = await Project.findOne({ projectCode: code });
  if (!project) {
    throw new Error('Project not found with this code');
  }
  req.project = project;
  return true;
});

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
  projectCodeValidator,
  body('reason')
    .notEmpty()
    .withMessage('Reason is required')
    .isLength({ max: 150 })
    .withMessage('Reason should not exceed 150 characters')
];

const approveRequestValidator: ValidationChain[] = [
  projectCodeValidator,
  body('requester')
    .notEmpty()
    .withMessage('Requester is required')
    .isMongoId()
    .withMessage('Requester should be valid Mongo Id')
    .custom(async (userId: string, { req }) => {
      const requester = await User.findById(userId);
      if (!requester) {
        throw new Error('Requester is not a valid user');
      }
      req.joinRequester = requester;
    }),
  body('action')
    .notEmpty()
    .withMessage('Action is required')
    .isIn(['Approve', 'Decline'])
    .withMessage('Enter a valid action')
];

/**
 *   sprintId: string;
  title: string;
  startDate: Date;
  endDate: Date;
  goal: string;
  creator: UserDocument;
  project: ProjectDocument;
  tasks: Array<TaskDocument>;
 */

const createSprintValidator: ValidationChain[] = [
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 50 })
    .withMessage('Title should not exceed 50 characters'),
  body('startDate')
    .notEmpty()
    .withMessage('Start date is required')
    .isDate()
    .withMessage('Enter a valid date'),
  body('endDate')
    .notEmpty()
    .withMessage('End date is required')
    .isDate()
    .withMessage('Enter a valid date'),
  body('goal')
    .notEmpty()
    .withMessage('Goal is required')
    .isLength({ max: 250 })
    .withMessage('Sprint goal should not exceed 250 characters')
];

export {
  createProjectValidator,
  joinRequestValidator,
  approveRequestValidator,
  createSprintValidator
};
