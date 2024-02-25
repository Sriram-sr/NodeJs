import { RequestHandler } from 'express';
import { validationResult } from 'express-validator';
import {
  HttpStatus,
  errorHandler,
  validationErrorHandler
} from '../utils/error-handlers';
import { customRequest } from '../middlewares/is-auth';
import Label, { LabelInput } from '../models/Label';
import Milestone, { MilestoneDocument } from '../models/Milestone';
import { UserDocument } from '../models/User';

export const getLabels: RequestHandler = async (_, res, next) => {
  try {
    const labels = await Label.find();
    res.status(HttpStatus.OK).json({
      message: 'Succesfuly fetched labels',
      labels
    });
  } catch (err) {
    errorHandler(
      'Somethig went wrong, could not get labels currently',
      HttpStatus.INTERNAL_SERVER_ERROR,
      next,
      err
    );
  }
};

export const createLabel: RequestHandler = async (
  req: customRequest,
  res,
  next
) => {
  const validationErrors = validationResult(req);
  if (!validationErrors.isEmpty()) {
    return validationErrorHandler(validationErrors.array(), next);
  }
  const { labelName, description } = req.body as LabelInput;
  let reviewerIds: Array<UserDocument> = [];
  if (req.reviewers) {
    reviewerIds = req.reviewers.map(reviewer => reviewer._id);
  }

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

export const getMilestones: RequestHandler = async (req, res, next) => {
  const { page: currentPage } = (req.query as { page: string }) || 1;
  const perPage = 10;

  try {
    const milestones = await Milestone.find()
      .skip((+currentPage - 1) * perPage)
      .limit(perPage);
    res.status(HttpStatus.OK).json({
      message: 'Successfully fetched milestones',
      milestones
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

export const createMilestone: RequestHandler = async (req, res, next) => {
  if (!validationResult(req).isEmpty()) {
    return validationErrorHandler(validationResult(req).array(), next);
  }
  const { title, description, dueDate } = req.body as MilestoneDocument;

  try {
    const milestone = await Milestone.create({ title, description, dueDate });

    res.status(HttpStatus.CREATED).json({
      message: 'Successfully created milestone',
      milestone
    });
  } catch (err) {
    errorHandler(
      'Somethig went wrong, could not create milestone currently',
      HttpStatus.INTERNAL_SERVER_ERROR,
      next,
      err
    );
  }
};
