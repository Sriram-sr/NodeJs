import { RequestHandler } from 'express';
import { validationResult } from 'express-validator';
import { customRequest } from '../middlewares/is-auth';
import {
  HttpStatus,
  errorHandler,
  validationErrorHandler
} from '../utils/error-handlers';
import PullRequest from '../models/PullRequest';
import { Counter } from '../utils/mongoose-counter';
import Label from '../models/Label';

export const createPullRequest: RequestHandler = async (
  req: customRequest,
  res,
  next
) => {
  if (!validationResult(req).isEmpty()) {
    return validationErrorHandler(validationResult(req).array(), next);
  }

  const prCounter = await Counter.findOneAndUpdate(
    { modelName: 'PullRequest', field: 'prId' },
    { $inc: { count: 1 } },
    { new: true }
  );

  try {
    const pullRequest = await PullRequest.create({
      prId: prCounter?.count,
      fixingIssue: req.issue?._id,
      label: req.label,
      status: 'open',
      events: [`${req.username} opened this pull request on ${new Date()}`],
      createdBy: req.userId,
      comments: [],
      reviews: []
    });

    req.issue?.events.push(
      `${req.username} mentioned a pull request #${pullRequest.prId} that may close this issue`
    );
    await req.issue?.save();

    res.status(HttpStatus.CREATED).json({
      message: 'Successfully created pull request',
      pullRequest
    });
  } catch (err) {
    errorHandler(
      'Something went wrong, could not create pull request currently',
      HttpStatus.INTERNAL_SERVER_ERROR,
      next,
      err
    );
  }
};

export const getPrReviewers: RequestHandler = async (
  req: customRequest,
  res,
  next
) => {
  const { labelName } = req.params as { labelName: string };

  try {
    const label = await Label.findOne({ labelName: labelName }).populate({
      path: 'apReviewers',
      select: 'username'
    });

    if (!label) {
      return errorHandler(
        'Label not found with this name',
        HttpStatus.NOT_FOUND,
        next
      );
    }

    if (!(label.apReviewers.length >= 1)) {
      return errorHandler(
        'Enter a valid AP label',
        HttpStatus.BAD_REQUEST,
        next
      );
    }

    res.status(HttpStatus.OK).json({
      message: 'Successfully fetched PR reviewers',
      reviewers: label.apReviewers
    });
  } catch (err) {
    errorHandler(
      'Something went wrong, could not get reviewers currently',
      HttpStatus.INTERNAL_SERVER_ERROR,
      next,
      err
    );
  }
};
