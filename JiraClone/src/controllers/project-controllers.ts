import { RequestHandler } from 'express';
import { validationResult } from 'express-validator';
import {
  errorHandler,
  HttpStatus,
  inputValidationHandler
} from '../utils/error-handlers';
import { Counter } from '../middlewares/mongoose-counter';
import { customRequest } from '../middlewares/is-auth';
import { JoinRequest, Project } from '../models/Project';

const createProject: RequestHandler = async (req: customRequest, res, next) => {
  if (!validationResult(req).isEmpty()) {
    return inputValidationHandler(validationResult(req).array(), next);
  }
  const { title, description, visibility } = req.body as {
    title: string;
    description: string;
    visibility: string;
  };

  try {
    const projectCounter = await Counter.findOneAndUpdate(
      { modelName: 'Project', fieldName: 'projectId' },
      { $inc: { count: 1 } },
      { new: true }
    );
    const project = await Project.create({
      projectCode: `${req.projectPrefix}${projectCounter?.count}`,
      title,
      description,
      visibility,
      creator: req._id,
      members: [req._id],
      joinRequests: [],
      sprints: [],
      status: 'active'
    });
    res.status(HttpStatus.CREATED).json({
      message: 'Successfully created project',
      project
    });
  } catch (err) {
    errorHandler(
      'Something went wrong, could not create project currently',
      HttpStatus.INTERNAL_SERVER_ERROR,
      next,
      err
    );
  }
};

const getJoinRequests: RequestHandler = async (
  req: customRequest,
  res,
  next
) => {
  if (!validationResult(req).isEmpty()) {
    return inputValidationHandler(validationResult(req).array(), next);
  }
  try {
    if (req.project?.creator.toString() !== req._id?.toString()) {
      return errorHandler(
        'Only project creator can view join requests',
        HttpStatus.FORBIDDEN,
        next
      );
    }
    const project = await req.project?.populate({
      path: 'joinRequests',
      populate: {
        path: 'requester',
        select: 'email -_id'
      }
    });
    res.status(HttpStatus.OK).json({
      message: 'Successfully fetched join requests',
      joinRequests: project?.joinRequests
    });
  } catch (err) {
    errorHandler(
      'Something went wrong, could not get requests currently',
      HttpStatus.INTERNAL_SERVER_ERROR,
      next,
      err
    );
  }
};

const requestToJoin: RequestHandler = async (req: customRequest, res, next) => {
  if (!validationResult(req).isEmpty()) {
    return inputValidationHandler(validationResult(req).array(), next);
  }
  const { reason } = req.body as { reason: string };

  try {
    const existingRequest = req.project?.joinRequests.find(
      request => request.requester.toString() === req._id?.toString()
    );
    if (existingRequest) {
      return errorHandler(
        'User already requested to join this project',
        HttpStatus.BAD_REQUEST,
        next
      );
    }
    req.project?.joinRequests.push({
      requester: req._id!,
      reason: reason,
      status: 'Requested'
    });
    await req.project?.save();
    res.status(HttpStatus.OK).json({
      message: 'Successfully requested for joining project'
    });
  } catch (err) {
    errorHandler(
      'Something went wrong, could not process this currently',
      HttpStatus.INTERNAL_SERVER_ERROR,
      next,
      err
    );
  }
};

const processJoinRequest: RequestHandler = async (
  req: customRequest,
  res,
  next
) => {
  if (!validationResult(req).isEmpty()) {
    return inputValidationHandler(validationResult(req).array(), next);
  }
  const { requestId } = req.params as { projectId: string; requestId: string };
  const { action } = req.body as { action: 'Approved' | 'Declined' };

  try {
    if (req.project?.creator.toString() !== req._id?.toString()) {
      return errorHandler(
        'Only project creator can process join requests',
        HttpStatus.FORBIDDEN,
        next
      );
    }
    const joinRequestIdx = req.project?.joinRequests.findIndex(
      request => request._id?.toString() === requestId
    );
    if (!(joinRequestIdx! >= 0)) {
      return errorHandler(
        'Join request with this Id is not found',
        HttpStatus.NOT_FOUND,
        next
      );
    }
    const joinRequest = req.project?.joinRequests[
      joinRequestIdx!
    ] as JoinRequest;
    joinRequest!.status = action;
    if (action === 'Approved') {
      req.project?.members.push(joinRequest.requester);
    }
    req.project!.joinRequests[joinRequestIdx!] = joinRequest;
    req.project?.save();
    res.status(HttpStatus.OK).json({
      message: `Successfully ${action} the join request`
    });
  } catch (err) {
    errorHandler(
      'Something went wrong, could not process this currently',
      HttpStatus.INTERNAL_SERVER_ERROR,
      next,
      err
    );
  }
};

export { createProject, getJoinRequests, requestToJoin, processJoinRequest };
