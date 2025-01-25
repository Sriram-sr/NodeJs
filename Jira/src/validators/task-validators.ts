import { body, param, ValidationChain } from 'express-validator';
import { Task } from '../models/Task';

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

const taskIdValidator: ValidationChain = param('taskId')
  .isMongoId()
  .withMessage('Task Id is not a valid Mongo Id')
  .custom(async (taskId: string, { req }) => {
    const task = await Task.findById(taskId);
    if (!task) {
      throw new Error('Task not found with the task Id');
    }
    req.task = task;
    return true;
  });

export { createTaskValidator, taskIdValidator };
