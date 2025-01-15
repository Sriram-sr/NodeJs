import { RequestHandler } from 'express';
import { validationResult } from 'express-validator';
import { customRequest } from './is-auth';
import {
  errorHandler,
  HttpStatus,
  inputValidationHandler
} from '../utils/error-handlers';

const isProjectCreator: RequestHandler = (req: customRequest, _, next) => {
  if (!validationResult(req).isEmpty()) {
    return inputValidationHandler(validationResult(req).array(), next);
  }
  if (req.project?.creator.toString() !== req.userId?.toString()) {
    return errorHandler(
      'Only creator of the project can process this request',
      HttpStatus.UNAUTHORIZED,
      next
    );
  }
  next();
};

export { isProjectCreator };
