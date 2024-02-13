import { param, body, validationResult } from 'express-validator';
import { Task, taskStatus } from '../models/Task';
import User from '../models/User';
import Label from '../models/Label';

export const validateLabels = async (labels: string[]) => {
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

export const validateTaskId = param('taskId')
  .isMongoId()
  .withMessage('Task Id is invalid Mongo Id')
  .custom(async (value, { req }) => {
    if (!validationResult(req).isEmpty()) {
      return;
    }
    const task = await Task.findById(value);
    if (!task) {
      throw new Error('Task not found with given task Id');
    }
    req.taskId = value;
    req.task = task;
  });

export const validateUserId = body('userId')
  .notEmpty()
  .withMessage('User Id is required')
  .isMongoId()
  .withMessage('User Id is invalid Mongo Id')
  .custom(async (value, { req }) => {
    if (!validationResult(req).isEmpty()) {
      return;
    }
    const user = await User.findById(value);
    if (!user) {
      throw new Error('User not found with given user Id');
    }
    req.user = user;
  });

export const validateLabelId = param('labelId')
  .isMongoId()
  .withMessage('Label Id is invalid Mongo Id')
  .custom(async (value: string, { req }) => {
    const label = await Label.findById(value);
    if (!label) {
      throw new Error('Label not found with given label Id');
    }
    req.label = label;
  });

export const validateTaskStatus = body('status')
  .notEmpty()
  .withMessage('Status is required')
  .isIn(taskStatus)
  .withMessage('Enter a valid task status');
