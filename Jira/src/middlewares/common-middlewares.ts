import { RequestHandler } from 'express';
import { customRequest } from './is-auth';
import { errorHandler, HttpStatus } from '../utils/error-handlers';

export const checkProjectCreator: RequestHandler = (
  req: customRequest,
  _,
  next
) => {
  if (req.project?.creator.toString() !== req.userId?.toString()) {
    return errorHandler(
      'Only creator of the project can process this request',
      HttpStatus.FORBIDDEN,
      next
    );
  }
  next();
};
