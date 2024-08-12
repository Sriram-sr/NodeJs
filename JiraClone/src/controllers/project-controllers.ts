import { RequestHandler } from 'express';
import { validationResult } from 'express-validator';
import {
  errorHandler,
  HttpStatus,
  inputValidationHandler
} from '../utils/error-handlers';
import { Counter } from '../middlewares/mongoose-counter';
import { customRequest } from '../middlewares/is-auth';
import { Project } from '../models/Project';

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

export { createProject, requestToJoin };
