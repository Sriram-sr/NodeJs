import { ValidationChain, body } from 'express-validator';
import Label from '../models/Label';

const validateLabels = async (labels: string[]) => {
  const existingLabels = await Label.find({ labelName: { $in: labels } });
  if (existingLabels.length !== labels.length) {
    const invalidLabels = labels.filter(
      label =>
        !existingLabels.some(existingLabel => existingLabel.labelName === label)
    );
    return [false, `Invalid labels found ${invalidLabels.join(', ')}`];
  }
  return [true, ''];
};

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
