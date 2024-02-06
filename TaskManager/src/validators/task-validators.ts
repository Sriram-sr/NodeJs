/**
 * interface Comment {
  text: string;
  commentedBy: Types.ObjectId;
  date: Date;
}

interface TaskDocument extends Document {
  title: string;
  description: string;
  status: string;
  labels: Array<LabelDocument>;
  createdBy: Types.ObjectId;
  assignedTo: Types.ObjectId;
  createdDate: Date;
  dueDate: Date;
  completionDate: Date;
  lastUpdatedDate: string;
  comments: Array<Comment>;
  collaborators: Array<UserDocument>;
  visibility: string;
}
 */

import { ValidationChain, body } from 'express-validator';

export const createTaskValidator: ValidationChain[] = [
  // title, description, labels, dueDate, visibility
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 10, max: 30 })
    .withMessage('Title cannot exceed 10 to 30 characters'),
  body('description')
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ max: 500 })
    .withMessage('Description should not exceed 500 characters'),
//   body('labels').isArray().withMessage('Labels should be array').isIn()
];
