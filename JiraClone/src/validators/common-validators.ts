import { body, ValidationChain } from 'express-validator';

const emailValidator: ValidationChain = body('email')
  .notEmpty()
  .withMessage('Email is required')
  .isEmail()
  .withMessage('Enter a valid email')
  .normalizeEmail();

const passwordValidator: ValidationChain = body('password')
  .notEmpty()
  .withMessage('Password is required')
  .trim()
  .isLength({ min: 6, max: 15 })
  .withMessage('Password should not exceed 6 to 15 characters');

const signupValidator: ValidationChain[] = [emailValidator, passwordValidator];

const signinValidator: ValidationChain[] = [
  emailValidator,
  body('password').notEmpty().withMessage('Password is required').trim()
];

const resetPasswordValidator: ValidationChain[] = [
  passwordValidator,
  body('token').notEmpty().withMessage('Token is required')
];

const createTaskValidator: ValidationChain[] = [
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 200 })
    .withMessage('Title should not exceed 200 characters'),
  body('description')
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ max: 2500 })
    .withMessage('Description should not exceed 2500 characters'),
  body('priority')
    .notEmpty()
    .withMessage('Priority is required')
    .isIn(['High', 'Medium', 'Low'])
    .withMessage('Enter a valid priority'),
  body('dueDate')
    .optional()
    .isDate()
    .withMessage('Enter a valid due date')
    .custom(dueDate => {
      if (new Date(dueDate) < new Date()) {
        throw new Error('Enter a date higher than the current date');
      }
      return true;
    }),
  body('projectId')
    .notEmpty()
    .withMessage('projectId is required')
    .isMongoId()
    .withMessage('Project Id is not a valid Mongo Id'),
  body('sprintId')
    .notEmpty()
    .withMessage('sprintId is required')
    .isMongoId()
    .withMessage('Sprint Id is not a valid Mongo Id'),
  body('assignee')
    .optional()
    .isMongoId()
    .withMessage('Assignee should be a valid Mongo Id')
];

export {
  emailValidator,
  signupValidator,
  signinValidator,
  resetPasswordValidator
};
