import { RequestHandler } from 'express';
import { validationResult } from 'express-validator';
import {
  errorHandler,
  HttpStatus,
  inputValidationHandler
} from '../utils/error-handlers';
import { Project, ProjectDocument } from '../models/Project';
import { customRequest } from '../middlewares/is-auth';
import { UserDocument } from '../models/User';

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
  if (!validationResult(req).isEmpty()) {
    return inputValidationHandler(validationResult(req).array(), next);
  }
  const { page } = req.query as { page?: number };
  const currentPage = page || 1;
  const perPage = 10;
  const skip = (currentPage - 1) * perPage;
  const limit = skip + perPage;
  const project = req.project as ProjectDocument;

  try {
    if (project.creator.toString() !== req.userId?.toString()) {
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
  const project = req.project as ProjectDocument;

  try {
    if (project.creator.toString() === req.userId?.toString()) {
      return errorHandler(
        'Creator of the project cannot request to join the project',
        HttpStatus.FORBIDDEN,
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

const processJoinRequest: RequestHandler = async (
  req: customRequest,
  res,
  next
) => {
  if (!validationResult(req).isEmpty()) {
    return inputValidationHandler(validationResult(req).array(), next);
  }
  const { requesterId } = req.params as {
    requesterId: string;
  };
  const { status } = req.body as { status: string };

  try {
    let project = req.project as ProjectDocument;
    if (project.creator.toString() !== req.userId?.toString()) {
      return errorHandler(
        'Only creator of the project can process join requests',
        HttpStatus.FORBIDDEN,
        next
      );
    }
    const joinRequestIdx = project.joinRequests.findIndex(
      request => request.requester.toString() === requesterId
    );
    if (joinRequestIdx === -1) {
      return errorHandler('Join request not found', HttpStatus.NOT_FOUND, next);
    }
    if (project.joinRequests[joinRequestIdx].status !== 'Requested') {
      return errorHandler(
        'Join request already processed',
        HttpStatus.BAD_REQUEST,
        next
      );
    }
    if (status === 'Approved') {
      project.joinRequests[joinRequestIdx].status = 'Approved';
      project.members.push(requesterId as unknown as UserDocument);
      // TODO: Add to user's active projects
    } else {
      project.joinRequests[joinRequestIdx].status = 'Declined';
    }
    await project.save();
    res.status(HttpStatus.OK).json({
      message: 'Successfully processed the join request',
      project
    });
  } catch (err) {
    errorHandler(
      'Something went wrong, could not process join request currently',
      HttpStatus.INTERNAL_SERVER_ERROR,
      next,
      err
    );
  }
};

const addMemberToProject: RequestHandler = async (req, res, next) => {
  const { projectId, memberId } = req.params as {
    projectId: string;
    memberId: string;
  };

  try {
    const project = await Project.findById(projectId);
    console.log(memberId, res);
    if (!project) {
      return errorHandler('Project not found', HttpStatus.NOT_FOUND, next);
    }
    // TODO: To complete this API
  } catch (err) {
    errorHandler(
      'Something went wrong, could not add member currently',
      HttpStatus.INTERNAL_SERVER_ERROR,
      next,
      err
    );
  }
};

export {
  createProject,
  getJoinRequests,
  requestToJoinProject,
  processJoinRequest,
  addMemberToProject
};
