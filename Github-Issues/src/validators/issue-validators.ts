import { ValidationChain, body, param } from 'express-validator';
import User from '../models/User';
import Label from '../models/Label';
import Issue from '../models/Issue';

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

const issueIdValidator: ValidationChain = param('issueId')
  .isInt()
  .withMessage('Issue Id should be integer and not any other value')
  .custom(async (value: number, { req }) => {
    const issue = await Issue.findOne({ issueId: value });
    if (!issue) {
      throw new Error('Git issue not found with given Id');
    }
    req.issue = issue;
  });

const labelsValidator: ValidationChain = body('labels')
  .optional()
  .isArray()
  .withMessage('Labels should be an array')
  .custom(async (values: string[], { req }) => {
    const labels = await Label.find({ labelName: { $in: values } });
    if (values.length !== labels.length) {
      const existingLabelNames = labels.map(label => label.labelName);
      const invalidLabels: string[] = [];
      values.forEach(label => {
        if (!existingLabelNames.includes(label)) {
          invalidLabels.push(label);
        }
      });
      throw new Error(`Invalid labels found ${invalidLabels.join(', ')}`);
    }
    req.labelIds = [];
    req.labelNames = [];
    labels.forEach(label => {
      req.labelIds.push(label._id);
      req.labelNames.push(label.labelName);
    });
  });

const createIssueValidator: ValidationChain[] = [
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
  labelsValidator,
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
      req.assignees = assignees;
    })
];

const commentValidator: ValidationChain[] = [
  issueIdValidator,
  body('text')
    .notEmpty()
    .withMessage('Comment text is required')
    .isLength({ max: 500 })
    .withMessage('Comment text should not exceed 500 characters')
];

const assignValidator: ValidationChain[] = [
  issueIdValidator,
  body('assignee')
    .notEmpty()
    .withMessage('Assignee name is required')
    .custom(async (value: string, { req }) => {
      const assignee = await User.findOne({ username: value });
      if (!assignee) {
        throw new Error('Invalid assignee name found');
      }
      req.assignee = assignee;
    })
];

const addLabelValidator: ValidationChain[] = [
  issueIdValidator,
  labelsValidator
];

export {
  filterValidUsers,
  createIssueValidator,
  assignValidator,
  commentValidator,
  addLabelValidator,
  issueIdValidator
};
