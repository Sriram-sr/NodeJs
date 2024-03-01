import { ValidationChain, body, param } from 'express-validator';
import Issue from '../models/Issue';
import Label from '../models/Label';
import PullRequest from '../models/PullRequest';

const prIdValidator: ValidationChain = param('prId')
  .isInt()
  .withMessage('PR Id should be integer and not any other value')
  .custom(async (value: number, { req }) => {
    const pullRequest = await PullRequest.findOne({ prId: value });
    if (!pullRequest) {
      throw new Error('PR not found with given Id');
    }
    req.pr = pullRequest;
  });

export const createPRValidator: ValidationChain[] = [
  body('fixingIssue')
    .notEmpty()
    .withMessage('Git issue number is required')
    .isInt()
    .withMessage('Git issue number should be a integer')
    .custom(async (value: string, { req }) => {
      const issue = await Issue.findOne({ issueId: value });
      if (!issue) {
        throw new Error('Enter a valid git issue Id');
      }
      req.issue = issue;
    }),
  body('labelName')
    .notEmpty()
    .withMessage('Label name is required')
    .custom(async (value: string, { req }) => {
      const label = await Label.findOne({ labelName: value });
      if (!label) {
        throw new Error('Enter a valid label name');
      }
      if (!(label.apReviewers.length >= 1)) {
        throw new Error('Enter a valid AP labelname');
      }
      req.label = label;
    })
];

export const commentOnPRValidator: ValidationChain[] = [
  prIdValidator,
  body('text')
    .notEmpty()
    .withMessage('Comment text is required')
    .isLength({ max: 500 })
    .withMessage('Comment text should not exceed 500 characters')
];

export const requestReviewValidator: ValidationChain[] = [
  prIdValidator,
  body('reviewers').isArray().withMessage('Reviewers should be an array')
];
