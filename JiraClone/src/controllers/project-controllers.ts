import { RequestHandler } from 'express';
import { validationResult } from 'express-validator';
import {
  errorHandler,
  HttpStatus,
  inputValidationHandler
} from '../utils/error-handlers';
import { Counter } from '../middlewares/mongoose-counter';
import { customRequest } from '../middlewares/is-auth';
import { JoinRequest, Project, ProjectDocument } from '../models/Project';
import { User, UserDocument } from '../models/User';

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
    const creator = await User.findById(req._id);
    creator?.activeProjects.push(project._id as ProjectDocument);
    await creator?.save();
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
        HttpStatus.CONFLICT,
        next
      );
    }
    req.project?.joinRequests.push({
      requester: req._id!,
      reason: reason,
      status: 'Requested'
    });
    await req.project?.save();
    const projectCreator = await User.findById(req.project?.creator);
    projectCreator?.notifications.push({
      category: 'General',
      message: `${req.email} requested to join the project`,
      isRead: false,
      createdAt: new Date()
    });
    await projectCreator?.save();
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
  const projectId = req.project?._id as ProjectDocument;

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
    const requester = await User.findById(joinRequest.requester);
    if (action === 'Approved') {
      req.project?.members.push(joinRequest.requester);
      requester?.activeProjects.unshift(projectId);
    }
    req.project!.joinRequests[joinRequestIdx!] = joinRequest;
    req.project?.save();
    requester?.notifications.push({
      category: 'General',
      message: `${req.email} ${action} your request to join the project`,
      isRead: false,
      createdAt: new Date()
    });
    await requester?.save();
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

const addMember: RequestHandler = async (req: customRequest, res, next) => {
  if (!validationResult(req).isEmpty()) {
    return inputValidationHandler(validationResult(req).array(), next);
  }
  const memberToAdd = req.memberToAdd?._id as UserDocument;
  const projectId = req.project?._id as ProjectDocument;

  try {
    if (req.project?.creator.toString() !== req._id?.toString()) {
      return errorHandler(
        'Only project creator can add new members',
        HttpStatus.FORBIDDEN,
        next
      );
    }
    const existingMember = req.project?.members.find(
      member => member.toString() === req.memberToAdd?._id?.toString()
    );
    if (existingMember) {
      return errorHandler(
        'User is already a project member',
        HttpStatus.CONFLICT,
        next
      );
    }

    req.project?.members.push(memberToAdd);
    await req.project?.save();
    req.memberToAdd?.activeProjects.unshift(projectId);
    req.memberToAdd?.notifications.push({
      category: 'General',
      message: `${req.email} added you as a member of a project`,
      isRead: false,
      createdAt: new Date()
    });
    await req.memberToAdd?.save();
    res.status(HttpStatus.OK).json({
      message: 'Successfully added user as project member'
    });
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
  requestToJoin,
  processJoinRequest,
  addMember
};
