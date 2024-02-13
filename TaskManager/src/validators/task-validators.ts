import { ValidationChain, body } from 'express-validator';
import { validateLabels } from '../middlewares/task-middlewares';

export const createTaskValidator: ValidationChain[] = [
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 10, max: 50 })
    .withMessage('Title cannot exceed 10 to 50 characters'),
  body('description')
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ max: 500 })
    .withMessage('Description should not exceed 500 characters'),
  body('dueDate')
    .notEmpty()
    .withMessage('Due date is required')
    .isDate()
    .withMessage('Enter a valid date'),
  body('labels')
    .optional()
    .isArray()
    .withMessage('Labels should be an array')
    .custom(async (lables: string[]) => {
      const [isValid, error] = (await validateLabels(lables)) as [
        boolean,
        string
      ];
      if (!isValid) {
        throw new Error(error);
      }
    }),
  body('visibility')
    .notEmpty()
    .withMessage('Visibility is required')
    .isIn(['public', 'private'])
    .withMessage('Visibility should be one of public/private')
];

export const commentOnTaskValidator: ValidationChain[] = [
  body('text')
    .notEmpty()
    .withMessage('Comment text is required')
    .isLength({ max: 500 })
    .withMessage('Comment text length should not exceed 500 characters')
];
