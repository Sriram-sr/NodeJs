import { RequestHandler } from 'express';
import { validationResult } from 'express-validator';
import { customRequest } from '../middlewares/is-auth';
import {
  HttpStatus,
  errorHandler,
  validationErrorHandler
} from '../utils/error-handlers';
import { Counter } from '../utils/mongoose-counter';
import Issue, { IssueInput } from '../models/Issue';

export const createIssue: RequestHandler = async (
  req: customRequest,
  res,
  next
) => {
  const validationErrors = validationResult(req);
  if (!validationErrors.isEmpty()) {
    return validationErrorHandler(validationErrors.array(), next);
  }
  const { title, description } = req.body as IssueInput;

  try {
    const issueCounter = await Counter.findOneAndUpdate(
      { modelName: 'Issue', field: 'issueId' },
      { $inc: { count: 1 } },
      { new: true }
    );

    let events: string[] = [];
    if (req.assignees) {
      const assignees = req.assignees
        .map(assignee => assignee.username)
        .join(', ');
      events = [`${req.username} assigned ${assignees}`];
    }

    const issue = await Issue.create({
      issueId: issueCounter?.count,
      title,
      description,
      status: 'open',
      createdBy: req.userId,
      events,
      labels: req.labelIds,
      assignees: req.assignees?.map(assignee => assignee._id),
      comments: []
    });

    res.status(HttpStatus.CREATED).json({
      message: 'Successfully created git issue',
      issue
    });
  } catch (err) {
    errorHandler(
      'Something went wrong, could not create issue currently',
      HttpStatus.INTERNAL_SERVER_ERROR,
      next,
      err
    );
  }
};

export const assignUser: RequestHandler = async (
  req: customRequest,
  res,
  next
) => {
  const validationErrors = validationResult(req);
  if (!validationErrors.isEmpty()) {
    return validationErrorHandler(validationErrors.array(), next);
  }

  try {
    const existingAssignee = req.issue?.assignees.find(
      assignee => assignee._id.toString() === req.assignee?._id.toString()
    );

    if (existingAssignee) {
      return errorHandler(
        'User is already assigned to this issue',
        HttpStatus.CONFLICT,
        next
      );
    }
    req.issue?.assignees.unshift(req.assignee?._id);
    req.issue?.events.push(
      `${req.username} assigned ${req.assignee?.username}`
    );
    const updatedIssue = await req.issue?.save();

    res.status(HttpStatus.OK).json({
      message: 'Successfully assigned user to git issue',
      updatedIssue
    });
  } catch (err) {
    errorHandler(
      'Something went wrong, could not assign user currently',
      HttpStatus.INTERNAL_SERVER_ERROR,
      next,
      err
    );
  }
};

export const addLabelOnIssue: RequestHandler = async (
  req: customRequest,
  res,
  next
) => {
  const validationErrors = validationResult(req);
  if (!validationErrors.isEmpty()) {
    return validationErrorHandler(validationErrors.array(), next);
  }

  try {
    if (req.issue) {
      const updatedLabels = req.issue?.labels.concat(req.labelIds!);
      req.issue.labels = updatedLabels;
      req.issue.events.push(
        `${req.username} added ${req.labelNames?.join(', ')} label${
          req.labelNames!.length > 1 ? 's' : ''
        }`
      );
      const updatedIssue = await req.issue.save();

      res.status(HttpStatus.OK).json({
        message: 'Successfully added labels',
        updatedIssue
      });
    }
  } catch (err) {
    errorHandler(
      'Something went wrong, could not add labels currently',
      HttpStatus.INTERNAL_SERVER_ERROR,
      next,
      err
    );
  }
};

export const commentOnIssue: RequestHandler = async (
  req: customRequest,
  res,
  next
) => {
  const validationErrors = validationResult(req);
  if (!validationErrors.isEmpty()) {
    return validationErrorHandler(validationErrors.array(), next);
  }
  const { text } = req.body as { text: string };

  try {
    req.issue?.comments.unshift({ text: text, commentedBy: req.userId! });
    const updatedIssue = await req.issue?.save();

    res.status(HttpStatus.CREATED).json({
      message: 'Successfully added comment',
      updatedIssue
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
