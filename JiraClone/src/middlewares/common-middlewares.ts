import { RequestHandler } from 'express';
import { customRequest } from './is-auth';
import { errorHandler, HttpStatus } from '../utils/error-handlers';

export const checkProjectCreator: RequestHandler = async (
  req: customRequest,
  _,
  next
) => {
  if (req.project?.creator.toString() !== req._id?.toString()) {
    return errorHandler(
      'Only project creator can process this request',
      HttpStatus.FORBIDDEN,
      next
    );
  }
  next();
};
