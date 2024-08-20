import { body, ValidationChain, param } from 'express-validator';
import { Project } from '../models/Project';
import { User } from '../models/User';

const createProjectValidator: ValidationChain[] = [
  body('projectCodePrefix')
    .notEmpty()
    .withMessage('Project prefix is required')
    .custom((value: string, { req }) => {
      if (!(value.trim().length === 2)) {
        throw new Error('Project prefix should be exactly 2 characters');
      }
      req.projectPrefix = value.trim().toUpperCase();
      return true;
    })
    .isLength({ max: 2, min: 2 })
    .withMessage('Project prefix should be exactly 2 characters'),
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 100 })
    .withMessage('Title should not exceed 100 characters'),
  body('description')
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 1000 })
    .withMessage('Title should not exceed 1000 characters'),
  body('visibility')
    .notEmpty()
    .withMessage('Visibility is required')
    .isIn(['public', 'private'])
    .withMessage('Enter a valid field for visibility')
];

const projectIdValidator: ValidationChain = param('projectId')
  .isMongoId()
  .withMessage('Project Id is not a valid MongoId')
  .custom(async (projectId: string, { req }) => {
    const project = await Project.findById(projectId);
    if (!project) {
      throw new Error('Project not found with this Id');
    }
    req.project = project;
    return true;
  });

const processJoinRequestValidator: ValidationChain[] = [
  projectIdValidator,
  body('action')
    .notEmpty()
    .withMessage('Action is required')
    .isIn(['Approved', 'Declined'])
    .withMessage('Enter a valid request action')
];

const memberIdValidation: ValidationChain = param('memberId')
  .isMongoId()
  .withMessage('Member Id is not a valid Mongo Id')
  .custom(async (memberId: string, { req }) => {
    const user = await User.findById(memberId);
    if (!user) {
      throw new Error('No valid user found with this member Id');
    }
    req.projectMember = user;
    return true;
  });

export {
  createProjectValidator,
  projectIdValidator,
  processJoinRequestValidator,
  memberIdValidation
};
