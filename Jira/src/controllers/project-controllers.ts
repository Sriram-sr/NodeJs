import { RequestHandler } from 'express';
import { validationResult } from 'express-validator';
import {
  HttpStatus,
  errorHandler,
  inputValidationHandler
} from '../utils/error-handlers';
import { Project } from '../models/Project';
import { Counter } from '../middlewares/mongoose-counter';
import { customRequest } from '../middlewares/is-auth';
import { UserDocument } from '../models/User';

const createProject: RequestHandler = async (req: customRequest, res, next) => {
  if (!validationResult(req).isEmpty()) {
    return inputValidationHandler(validationResult(req).array(), next);
  }
  const { projectCodePrefix, title, description, visibility } = req.body as {
    projectCodePrefix: string;
    title: string;
    description: string;
    visibility: string;
  };

  try {
    const projectCount = await Counter.findOneAndUpdate(
      { modelName: 'Project', field: 'projectId' },
      { $inc: { count: 1 } },
      { new: true }
    );
    console.log(
      'count is ',
      projectCount?.count,
      'and',
      `${projectCodePrefix}${projectCount?.count}`
    );
    const project = await Project.create({
      projectCode: `${projectCodePrefix}${projectCount?.count}`,
      title,
      description,
      visibility,
      creator: req.userId,
      members: [],
      joinRequests: [],
      sprints: []
    });
    res.status(HttpStatus.CREATED).json({
      message: 'Successfully created project',
      project
    });
  } catch (err) {
    errorHandler(
      'Something went wrong, could not create project curently',
      HttpStatus.INTERNAL_SERVER_ERROR,
      next,
      err
    );
  }
};

const requestToJoinProject: RequestHandler = async (
  req: customRequest,
  res,
  next
) => {
  if (!validationResult(req).isEmpty()) {
    return inputValidationHandler(validationResult(req).array(), next);
  }
  const { projectId, reason } = req.body as {
    projectId: string;
    reason: string;
  };

  try {
    const project = await Project.findById(projectId);
    if (!project) {
      return errorHandler(
        'Project not found with this Id',
        HttpStatus.NOT_FOUND,
        next
      );
    }
    project.joinRequests.unshift({
      requester: req.userId!,
      reason: reason,
      status: 'Requested'
    });
    project.save();
    res.status(HttpStatus.OK).json({
      message: 'Successfully requested to join the project'
    });
  } catch (err) {
    errorHandler(
      'Something went wrong, could not process this request curently',
      HttpStatus.INTERNAL_SERVER_ERROR,
      next,
      err
    );
  }
};

const approveJoinRequest: RequestHandler = async (
  req: customRequest,
  res,
  next
) => {
  if (!validationResult(req).isEmpty()) {
    return inputValidationHandler(validationResult(req).array(), next);
  }
  const { projectId, requester, action } = req.body as {
    projectId: string;
    requester: UserDocument;
    action: string;
  };

  try {
    const project = await Project.findById(projectId);
    if (!project) {
      return errorHandler(
        'Project not found with this Id',
        HttpStatus.NOT_FOUND,
        next
      );
    }
    if (project.creator.toString() !== req.userId?.toString()) {
      return errorHandler(
        'Only creator of the project can approve/decline requests',
        HttpStatus.FORBIDDEN,
        next
      );
    }
    const userRequestIdx = project.joinRequests.findIndex(
      request => request.requester.toString() === requester.toString()
    );
    if (!(userRequestIdx >= 0)) {
      return errorHandler(
        'User has not requested to join yet',
        HttpStatus.BAD_REQUEST,
        next
      );
    }
    if (action === 'Approve') {
      project.members.push(requester);
      project.joinRequests[userRequestIdx].status = 'Approved';
    } else if (action === 'Decline') {
      project.joinRequests[userRequestIdx].status = 'Declined';
    }
    await project.save();
  } catch (err) {
    errorHandler(
      'Something went wrong, could not process this request curently',
      HttpStatus.INTERNAL_SERVER_ERROR,
      next,
      err
    );
  }
};

export { createProject, requestToJoinProject, approveJoinRequest };
