import { RequestHandler } from 'express';
import { validationResult } from 'express-validator';
import {
  errorHandler,
  HttpStatus,
  inputValidationHandler
} from '../utils/error-handlers';
import { Project } from '../models/Project';
import { customRequest } from '../middlewares/is-auth';

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
    const project = await Project.create({
      title: title,
      description: description,
      visibility: visibility,
      creator: req.userId,
      members: [req.userId],
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
  const { projectId } = req.params as { projectId: string };
  const { page } = req.query as { page?: number };
  const currentPage = page || 1;
  const perPage = 10;
  const skip = (currentPage - 1) * perPage;
  const limit = skip + perPage;

  try {
    const project = await Project.findById(projectId);
    if (!project) {
      return errorHandler(
        'Requested project not found',
        HttpStatus.NOT_FOUND,
        next
      );
    }
    if (project?.creator.toString() !== req.userId?.toString()) {
      return errorHandler(
        'Only creator of the project can get the join requests',
        HttpStatus.FORBIDDEN,
        next
      );
    }
    await project.populate({
      path: 'joinRequests.requester',
      select: 'email'
    });
    const joinRequests = project.joinRequests.slice(skip, limit);
    res.status(HttpStatus.OK).json({
      message: 'Successfully fetched join requests',
      joinRequests
    });
  } catch (err) {
    errorHandler(
      'Something went wrong, could not get join requests currently',
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
  const { reason } = req.body as { reason: string };
  const { projectId } = req.params as { projectId: string };

  try {
    const project = await Project.findById(projectId);
    if (!project) {
      return errorHandler(
        'Requested project not found',
        HttpStatus.NOT_FOUND,
        next
      );
    }
    const existingRequest = project.joinRequests.find(
      request => request.requester.toString() === req.userId?.toString()
    );
    if (existingRequest) {
      return errorHandler(
        'User requested to join the project already',
        HttpStatus.CONFLICT,
        next
      );
    }
    project.joinRequests.unshift({
      requester: req.userId!,
      reason: reason,
      status: 'Requested'
    });
    await project.save();
    res.status(HttpStatus.CREATED).json({
      message: 'Successfully requested to join project'
    });
  } catch (err) {
    errorHandler(
      'Something went wrong, could not request to join project',
      HttpStatus.INTERNAL_SERVER_ERROR,
      next,
      err
    );
  }
};

export { createProject, getJoinRequests, requestToJoinProject };
