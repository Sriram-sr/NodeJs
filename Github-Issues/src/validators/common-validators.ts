import { ValidationChain, body } from 'express-validator';
import { filterValidUsers } from './issue-validators';
import Label from '../models/Label';
import Milestone from '../models/Milestone';

export const createLabelValidator: ValidationChain[] = [
  body('labelName')
    .notEmpty()
    .withMessage('Label name is required')
    .isLength({ max: 15 })
    .withMessage('Label name should be within 15 characters')
    .custom(async value => {
      const existingLabel = await Label.findOne({ labelName: value });
      if (existingLabel) {
        throw new Error('Label with the same name already exists');
      }
    }),
  body('description')
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 6, max: 40 })
    .withMessage('Description should not exceed 6 to 40 characters'),
  body('reviewers')
    .optional()
    .isArray()
    .withMessage('reviewers should be an array')
    .custom(async (values: string[], { req }) => {
      const [reviewers, invalidReviewers] = await filterValidUsers(values);
      if (invalidReviewers.length > 0) {
        throw new Error(
          `Invalid reviewers found ${invalidReviewers.join(', ')}`
        );
      }
      req.reviewers = reviewers;
    })
];

export const createMilestoneValidator: ValidationChain[] = [
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 6, max: 50 })
    .withMessage('Title should not exceed 6 to 50 characters')
    .custom(async (value: string) => {
      const existingMilestone = await Milestone.findOne({ title: value });
      if (existingMilestone) {
        throw new Error('Milestone with this title exists already');
      }
    }),
  body('description').notEmpty().withMessage('Description is required'),
  body('dueDate')
    .notEmpty()
    .withMessage('Due date is required')
    .isDate()
    .withMessage('Enter a valid date')
];
