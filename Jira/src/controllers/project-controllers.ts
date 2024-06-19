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
    const existingRequest = project.joinRequests.find(
      request => request.requester.toString() === req.userId?.toString()
    );
    if (existingRequest) {
      return errorHandler(
        'User already requested for joining project',
        HttpStatus.BAD_REQUEST,
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
  const { projectCode, action } = req.body as {
    projectCode: string;
    action: string;
  };

  try {
    const project = await Project.findOne({ projectCode: projectCode });
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
      request =>
        request.requester.toString() === req.joinRequester?._id!.toString()
    );
    if (!(userRequestIdx >= 0)) {
      return errorHandler(
        'User has not requested to join yet',
        HttpStatus.BAD_REQUEST,
        next
      );
    }
    if (action === 'Approve') {
      const requesterId = req.joinRequester?._id as UserDocument;
      project.members.push(requesterId);
      project.joinRequests[userRequestIdx].status = 'Approved';
      req.joinRequester?.activeProjects.push(projectCode);
      await req.joinRequester?.save();
    } else if (action === 'Decline') {
      project.joinRequests[userRequestIdx].status = 'Declined';
    }
    await project.save();
    res.status(HttpStatus.OK).json({
      message: `Successfully ${action}d the join request`
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

export { createProject, requestToJoinProject, approveJoinRequest };
