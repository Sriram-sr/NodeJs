import { body, ValidationChain } from 'express-validator';


export const createTaskValidator: ValidationChain[] = [
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 50 })
    .withMessage('Title should not exceed 20 characters'),
  body('description')
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ max: 2000 })
    .withMessage('Description should not exceed 2000 characters'),
  body('priority')
    .notEmpty()
    .withMessage('Priority is required')
    .isIn(['High', 'Medium', 'Low'])
    .withMessage('Enter a valid task priority'),
  body('dueDate').optional().isDate().withMessage('Enter a valid due date'),
  body('sprintId')
    .notEmpty()
    .withMessage('Sprint Id is required')
    .isMongoId()
    .withMessage('Sprint Id should be a valid Mongo Id'),
  body('projectId')
    .notEmpty()
    .withMessage('Project Id is required')
    .isMongoId()
    .withMessage('Project Id should be a valid Mongo Id'),
  body('assignee')
    .optional()
    .isMongoId()
    .withMessage('Enter a valid Mongo Id for assignee')
];
