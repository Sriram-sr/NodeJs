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
        .join(' ,');
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
