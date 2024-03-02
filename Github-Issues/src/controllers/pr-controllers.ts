import { RequestHandler } from 'express';
import { validationResult } from 'express-validator';
import { Types } from 'mongoose';
import { customRequest } from '../middlewares/is-auth';
import {
  HttpStatus,
  errorHandler,
  validationErrorHandler
} from '../utils/error-handlers';
import PullRequest, { Comment } from '../models/PullRequest';
import { Counter } from '../utils/mongoose-counter';
import Label from '../models/Label';
import Issue from '../models/Issue';

interface getPRsParams {
  page: number;
  status: 'open' | 'closed';
  createdBy: Types.ObjectId;
  label: Types.ObjectId;
  reviewedBy: Types.ObjectId;
  newest: boolean;
  oldest: boolean;
}

const getPullRequests: RequestHandler = async (req, res, next) => {
  try {
    const { page, status, createdBy, label, reviewedBy, newest, oldest } =
      req.query as Partial<getPRsParams>;
    const currentPage = page ?? 1;
    const perPage = 10;
    const sortOptions: any = newest
      ? { createdAt: -1 }
      : oldest
      ? { createdAt: 1 }
      : {};
    let filters = {};
    if (status) filters = { status };
    if (createdBy) filters = { ...filters, createdBy };
    if (label) filters = { ...filters, label };
    if (reviewedBy) filters = { ...filters, reviews: reviewedBy };

    const pullRequests = await PullRequest.find(filters)
      .skip((currentPage - 1) * perPage)
      .limit(perPage)
      .sort(sortOptions);

    res.status(HttpStatus.OK).json({
      message: 'Successfully fetched PRs',
      pullRequests
    });
  } catch (err) {
    errorHandler(
      'Something went wrong, could not get PRs currently',
      HttpStatus.INTERNAL_SERVER_ERROR,
      next,
      err
    );
  }
};

const getSinglePR: RequestHandler = async (req, res, next) => {
  if (!validationResult(req).isEmpty()) {
    return validationErrorHandler(validationResult(req).array(), next);
  }

  const { prId } = req.params as { prId: string };

  const pullRequest = await PullRequest.findOne({ prId: prId })
    .populate({ path: 'label', select: 'labelName -_id' })
    .populate({ path: 'reviews', select: 'username -_id' })
    .populate({
      path: 'comments',
      populate: {
        path: 'commentedBy',
        model: 'User',
        select: 'username -_id'
      }
    })
    .populate({ path: 'createdBy', select: 'username -_id' });

  res.status(HttpStatus.OK).json({
    message: 'Successfully fetched PR',
    pullRequest
  });
};

const createPullRequest: RequestHandler = async (
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

const getPRReviewers: RequestHandler = async (
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

const commentOnPR: RequestHandler = async (req: customRequest, res, next) => {
  if (!validationResult(req).isEmpty()) {
    return validationErrorHandler(validationResult(req).array(), next);
  }
  const { text } = req.body as { text: string };

  try {
    const comment: Comment = {
      text,
      commentedBy: req.userId!,
      createdAt: new Date()
    };
    req.pr?.comments.push(comment);
    const updatedPR = await req.pr?.save();

    res.status(HttpStatus.OK).json({
      message: 'Successfully added comment in PR',
      updatedPR
    });
  } catch (err) {
    errorHandler(
      'Something went wrong, could not add comment currently',
      HttpStatus.INTERNAL_SERVER_ERROR,
      next,
      err
    );
  }
};

const requestReview: RequestHandler = async (req: customRequest, res, next) => {
  if (!validationResult(req).isEmpty()) {
    return validationErrorHandler(validationResult(req).array(), next);
  }

  try {
    const { reviewers } = req.body as { reviewers: string[] };

    req.pr?.events.push(
      `${req.username} requested review from ${reviewers.join(', ')}`
    );
    const updatedPR = await req.pr?.save();

    res.status(HttpStatus.OK).json({
      message: 'Successfully requested for review',
      updatedPR
    });
  } catch (err) {
    errorHandler(
      'Something went wrong, could not request review currently',
      HttpStatus.INTERNAL_SERVER_ERROR,
      next,
      err
    );
  }
};

const approvePR: RequestHandler = async (req: customRequest, res, next) => {
  if (!validationResult(req).isEmpty()) {
    return validationErrorHandler(validationResult(req).array(), next);
  }

  try {
    if (req.userId?.toString() === req.pr?.createdBy.toString()) {
      return errorHandler(
        "Authors can't approve their own pull request",
        HttpStatus.FORBIDDEN,
        next
      );
    }

    const label = await Label.findById(req.pr?.label).select(
      'apReviewers -_id'
    );

    if (
      !label?.apReviewers.find(
        reviewer => reviewer._id.toString() === req.userId?.toString()
      )
    ) {
      return errorHandler(
        'Not a valid reviewer to approve this PR',
        HttpStatus.FORBIDDEN,
        next
      );
    }

    const isApproved = req.pr?.reviews.find(
      reviewer => reviewer.toString() === req.userId?.toString()
    );
    if (isApproved) {
      return errorHandler(
        'Reviewer already approved this PR',
        HttpStatus.CONFLICT,
        next
      );
    }

    req.pr?.reviews.push(req.userId!);
    req.pr?.events.push(`${req.username} approved the PR on ${new Date()}`);
    const updatedPR = await req.pr?.save();

    res.status(HttpStatus.OK).json({
      message: 'Sucessfully approved PR',
      updatedPR
    });
  } catch (err) {
    errorHandler(
      'Something went wrong, could not approve PR currently',
      HttpStatus.INTERNAL_SERVER_ERROR,
      next,
      err
    );
  }
};

const mergePR: RequestHandler = async (req: customRequest, res, next) => {
  if (!validationResult(req).isEmpty()) {
    return validationErrorHandler(validationResult(req).array(), next);
  }
  let mergedPR;

  try {
    if (!(req.pr?.reviews.length! >= 2)) {
      return errorHandler(
        'Cannot merge before getting atleast two team reviews',
        HttpStatus.BAD_REQUEST,
        next
      );
    }

    if (req.pr) {
      req.pr.status = 'closed';
      req.pr.events.push(`${req.username} merged this PR on ${new Date()}`);
      mergedPR = await req.pr.save();
    }

    const fixingIssue = await Issue.findById(req.pr?.fixingIssue).select(
      'fixedBy status events'
    );
    if (fixingIssue && fixingIssue.status !== 'closed') {
      fixingIssue.status = 'closed';
      fixingIssue.fixedBy = req.pr?._id;
      fixingIssue.events.push(
        `Closed this issue as #${req.pr?.prId} is merged`
      );
      await fixingIssue.save();
    }

    res.status(HttpStatus.OK).json({
      message: 'Successfully merged the PR',
      mergedPR
    });
  } catch (err) {
    errorHandler(
      'Something went wrong, could not merge PR currently',
      HttpStatus.INTERNAL_SERVER_ERROR,
      next,
      err
    );
  }
};

export {
  getPullRequests,
  getSinglePR,
  createPullRequest,
  getPRReviewers,
  commentOnPR,
  requestReview,
  approvePR,
  mergePR
};
