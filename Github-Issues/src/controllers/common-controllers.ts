import { RequestHandler } from 'express';
import { validationResult } from 'express-validator';
import {
  HttpStatus,
  errorHandler,
  validationErrorHandler
} from '../utils/error-handlers';
import { customRequest } from '../middlewares/is-auth';
import Label, { LabelInput } from '../models/Label';

export const createLabel: RequestHandler = async (
  req: customRequest,
  res,
  next
) => {
  // TODO: Make reviewers optional for a label.
  const validationErrors = validationResult(req);
  if (!validationErrors.isEmpty()) {
    return validationErrorHandler(validationErrors.array(), next);
  }
  const { labelName, description } = req.body as LabelInput;
  const reviewerIds = req.reviewerIds;

  try {
    const label = await Label.create({
      labelName,
      description,
      apReviewers: reviewerIds
    });
    res.status(HttpStatus.CREATED).json({
      message: 'Successfully created label',
      label
    });
  } catch (err) {
    errorHandler(
      'Somethig went wrong, could not create label currently',
      HttpStatus.INTERNAL_SERVER_ERROR,
      next,
      err
    );
  }
};
