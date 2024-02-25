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
import Milestone from '../models/Milestone';

const createIssue: RequestHandler = async (req: customRequest, res, next) => {
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

    let events: string[] = [
      `${req.username} opened this issue on ${new Date()}`
    ];
    if (req.assignees) {
      const assignees = req.assignees
        .map(assignee => assignee.username)
        .join(', ');
      events.push(`${req.username} assigned ${assignees} on ${new Date()}`);
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

const assignUser: RequestHandler = async (req: customRequest, res, next) => {
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
    let assignEventStr;

    if (req.userId?.toString() === req.assignee?._id.toString()) {
      assignEventStr = `${req.username} self assigned this on ${new Date()}`;
    } else {
      assignEventStr = `${req.username} assigned ${
        req.assignee?.username
      } on ${new Date()}`;
    }
    req.issue?.events.push(assignEventStr);
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

const unassignUser: RequestHandler = async (req: customRequest, res, next) => {
  if (!validationResult(req).isEmpty()) {
    return validationErrorHandler(validationResult(req).array(), next);
  }

  try {
    const assigneeIdx = req.issue?.assignees.findIndex(
      assignee => assignee._id.toString() === req.assignee?._id.toString()
    );
    if (!(assigneeIdx! >= 0)) {
      return errorHandler(
        'User is not assigned earlier to unassign',
        HttpStatus.BAD_REQUEST,
        next
      );
    }
    req.issue?.assignees.splice(assigneeIdx!, 1);
    let unassignEventStr;
    if (req.userId?.toString() === req.assignee?._id.toString()) {
      unassignEventStr = `${req.username} unassigned them on ${new Date()}`;
    } else {
      unassignEventStr = `${req.username} unassigned ${
        req.assignee?.username
      } on ${new Date()}`;
    }
    req.issue?.events.push(unassignEventStr);
    const updatedIssue = await req.issue?.save();

    res.status(HttpStatus.OK).json({
      message: 'Successfully unssigned user from git issue',
      updatedIssue
    });
  } catch (err) {
    errorHandler(
      'Something went wrong, could not unassign user currently',
      HttpStatus.INTERNAL_SERVER_ERROR,
      next,
      err
    );
  }
};

const getLabelsOnIssue: RequestHandler = async (req, res, next) => {
  const { issueId } = req.params as { issueId: string };

  try {
    const issue = await Issue.findOne({ issueId: issueId }).populate({
      path: 'labels',
      select: 'labelName -_id'
    });
    if (!issue) {
      return errorHandler(
        'Issue not found with given issue Id',
        HttpStatus.NOT_FOUND,
        next
      );
    }

    res.status(HttpStatus.OK).json({
      message: 'Successfully fetched label present in the issue',
      issueTitle: issue.title,
      labels: issue?.labels
    });
  } catch (err) {
    errorHandler(
      'Something went wrong, could not get labels currently',
      HttpStatus.INTERNAL_SERVER_ERROR,
      next,
      err
    );
  }
};

const addLabelOnIssue: RequestHandler = async (
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
        } on ${new Date()}`
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

const commentOnIssue: RequestHandler = async (
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

const closeIssue: RequestHandler = async (req: customRequest, res, next) => {
  if (!validationResult(req).isEmpty()) {
    return validationErrorHandler(validationResult(req).array(), next);
  }

  if (req.issue?.status === 'closed') {
    return errorHandler(
      'Git issue is already in closed state',
      HttpStatus.BAD_REQUEST,
      next
    );
  }

  try {
    if (req.issue) {
      req.issue.status = 'closed';
    }
    req.issue?.events.push(
      `${req.username} closed this issue on ${new Date()}`
    );
    const updatedIssue = await req.issue?.save();

    res.status(HttpStatus.OK).json({
      message: 'Successfully closed the issue',
      updatedIssue
    });
  } catch (err) {
    errorHandler(
      'Something went wrong, could not close the issue currently',
      HttpStatus.INTERNAL_SERVER_ERROR,
      next,
      err
    );
  }
};

const reopenIssue: RequestHandler = async (req: customRequest, res, next) => {
  if (!validationResult(req).isEmpty()) {
    return validationErrorHandler(validationResult(req).array(), next);
  }

  if (req.issue?.status === 'open') {
    return errorHandler(
      'Git issue is already in open state',
      HttpStatus.BAD_REQUEST,
      next
    );
  }

  try {
    if (req.issue) {
      req.issue.status = 'open';
    }
    req.issue?.events.push(
      `${req.username} re-opened this issue on ${new Date()}`
    );
    const updatedIssue = await req.issue?.save();

    res.status(HttpStatus.OK).json({
      message: 'Successfully re-opened the issue',
      updatedIssue
    });
  } catch (err) {
    errorHandler(
      'Something went wrong, could not re-open the issue currently',
      HttpStatus.INTERNAL_SERVER_ERROR,
      next,
      err
    );
  }
};

const addMilestone: RequestHandler = async (req: customRequest, res, next) => {
  if (!validationResult(req).isEmpty()) {
    return validationErrorHandler(validationResult(req).array(), next);
  }
  const { title } = req.body as { title: string };

  try {
    const milestone = await Milestone.findOne({ title: title });
    if (!milestone) {
      return errorHandler(
        'Milestone not found to link in the git issue',
        HttpStatus.NOT_FOUND,
        next
      );
    }

    if (req.issue) {
      req.issue.milestone = milestone._id;
      req.issue.events.push(
        `${req.username} added this to ${
          milestone.title
        } milestone on ${new Date()}`
      );
    }
    const updatedIssue = await req.issue?.save();
    res.status(HttpStatus.OK).json({
      message: 'Sucessfully added milestone to the issue',
      updatedIssue
    });
  } catch (err) {
    errorHandler(
      'Something went wrong, could not add milestone currently',
      HttpStatus.INTERNAL_SERVER_ERROR,
      next,
      err
    );
  }
};

const clearMilestone: RequestHandler = async (
  req: customRequest,
  res,
  next
) => {
  if (!validationResult(req).isEmpty()) {
    return validationErrorHandler(validationResult(req).array(), next);
  }
  const { title } = req.body as { title: string };

  try {
    if (!req.issue?.milestone) {
      return errorHandler(
        'No milestone present in the git issue to remove',
        HttpStatus.BAD_REQUEST,
        next
      );
    }
    req.issue.milestone = undefined;
    req.issue.events.push(
      `${req.username} removed ${title} milestone on ${new Date()}`
    );
    const updatedIssue = await req.issue?.save();
    res.status(HttpStatus.OK).json({
      message: 'Sucessfully removed milestone from the issue',
      updatedIssue
    });
  } catch (err) {
    errorHandler(
      'Something went wrong, could not remove milestone currently',
      HttpStatus.INTERNAL_SERVER_ERROR,
      next,
      err
    );
  }
};

export {
  createIssue,
  assignUser,
  unassignUser,
  commentOnIssue,
  addLabelOnIssue,
  getLabelsOnIssue,
  closeIssue,
  reopenIssue,
  addMilestone,
  clearMilestone
};
