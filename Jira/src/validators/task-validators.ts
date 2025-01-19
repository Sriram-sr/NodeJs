import { body, ValidationChain } from 'express-validator';

const createTaskValidator: ValidationChain[] = [
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 200 })
    .withMessage('Title should not exceed 200 characters'),
  body('description')
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ max: 500 })
    .withMessage('Description should not exceed 500 characters'),
  body('priority')
    .notEmpty()
    .withMessage('Priority is required')
    .isIn(['High', 'Medium', 'Low'])
    .withMessage('Enter a valid task priority'),
  body('dueDate')
    .optional()
    .isDate()
    .withMessage('Enter a valid due date')
    .custom((dueDate: string) => {
      if (
        new Date(dueDate).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0)
      ) {
        throw new Error('Due date should not be lesser than current date');
      }
      return true;
    }),
  body('sprintId')
    .notEmpty()
    .withMessage('SprintId is required')
    .isMongoId()
    .withMessage('Sprint Id should be a valid Mongo Id'),
  body('projectId')
    .notEmpty()
    .withMessage('ProjectId is required')
    .isMongoId()
    .withMessage('Project Id should be a valid Mongo Id'),
  body('assignee')
    .optional()
    .isMongoId()
    .withMessage('Provide valid Mongo Id for assignee')
];

export { createTaskValidator };
