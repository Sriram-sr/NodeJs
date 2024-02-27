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

// TODO: Get PR reviewers route should be
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
