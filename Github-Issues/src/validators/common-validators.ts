import { ValidationChain, body } from 'express-validator';
import User from '../models/User';
import Label from '../models/Label';

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
    .isArray()
    .withMessage('reviewers should be an array')
    .custom(async (reviewers: string[], { req }) => {
      const existingUsers = await User.find({ username: { $in: reviewers } });
      if (existingUsers.length !== reviewers.length) {
        const existingUsernames = existingUsers.map(user => user.username);
        const invalidUsernames = [];
        for (const user of reviewers) {
          if (!existingUsernames.includes(user)) {
            invalidUsernames.push(user);
          }
        }
        throw new Error(
          `Invalid reviewers found ${invalidUsernames.join(', ')}`
        );
      }

      req.reviewerIds = existingUsers.map(user => user._id);
    })
];
