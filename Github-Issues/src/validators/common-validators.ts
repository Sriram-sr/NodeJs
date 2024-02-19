import { ValidationChain, body } from 'express-validator';
import User from '../models/User';
import Label from '../models/Label';

const filterValidUsers = async (users: string[]) => {
  const invalidUsernames = [];
  const existingUsers = await User.find({ username: { $in: users } });
  if (existingUsers.length !== users.length) {
    const existingUsernames = existingUsers.map(user => user.username);
    for (const user of users) {
      if (!existingUsernames.includes(user)) {
        invalidUsernames.push(user);
      }
    }
  }
  return [existingUsers, invalidUsernames];
};

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
      // TODO: Correct this change in createLabel controller
    })
];

export const createIssueValidator: ValidationChain[] = [
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 100 })
    .withMessage('Title should not exceed 100 characters'),
  body('description')
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ max: 1000 })
    .withMessage('Description should not exceed 1000 characters'),
  body('labels')
    .optional()
    .isArray()
    .withMessage('Labels should be an array')
    .custom(async (values: string[], { req }) => {
      const labels = await Label.find({ labelName: { $in: values } });
      req.labelIds = labels.map(label => label._id);
    }),
  body('assignees')
    .optional()
    .isArray()
    .withMessage('Assignees should be an array')
    .custom(async (values: string[], { req }) => {
      const [assignees, invalidAssignees] = await filterValidUsers(values);
      if (invalidAssignees.length > 0) {
        throw new Error(
          `Invalid assignees found ${invalidAssignees.join(', ')}`
        );
      }
      req.assigneeIds = assignees;
    })
];
