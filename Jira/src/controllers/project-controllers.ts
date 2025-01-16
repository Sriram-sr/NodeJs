import { RequestHandler } from 'express';
import { validationResult } from 'express-validator';
import {
  errorHandler,
  HttpStatus,
  inputValidationHandler
} from '../utils/error-handlers';
import { Project, ProjectDocument } from '../models/Project';
import { customRequest } from '../middlewares/is-auth';
import { User, UserDocument } from '../models/User';
import { sendNotification } from '../utils/helper';

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
  const { page } = req.query as { page?: number };
  const currentPage = page || 1;
  const perPage = 10;
  const skip = (currentPage - 1) * perPage;
  const limit = skip + perPage;
  const project = req.project as ProjectDocument;

  try {
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
    await sendNotification(
      `${req.email} requested to join the project`,
      'ProjectJoinRequest',
      project.creator,
      true
    );
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
  const { requesterId } = req.params as {
    requesterId: string;
  };
  const { status } = req.body as { status: string };

  try {
    let project = req.project as ProjectDocument;
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
    const requester = await User.findById(requesterId);
    if (!requester) {
      return errorHandler(
        'Requested user not found',
        HttpStatus.NOT_FOUND,
        next
      );
    }
    if (status === 'Approved') {
      project.joinRequests[joinRequestIdx].status = 'Approved';
      project.members.push(requesterId as unknown as UserDocument);
      requester.activeProjects.push(project._id as ProjectDocument);
      await requester.save();
    } else {
      project.joinRequests[joinRequestIdx].status = 'Declined';
    }
    await project.save();
    await sendNotification(
      `${req.email} ${status.toLowerCase()} your join the request`,
      'ProjectJoinRequest',
      requester
    );
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

const addMemberToProject: RequestHandler = async (
  req: customRequest,
  res,
  next
) => {
  const { memberId } = req.params as {
    memberId: string;
  };
  const project = req.project as ProjectDocument;
  try {
    const existingMember = project.members.find(
      member => member.toString() === memberId
    );
    if (existingMember) {
      return errorHandler(
        'User is already a member of the project',
        HttpStatus.CONFLICT,
        next
      );
    }
    const member = await User.findById(memberId);
    if (!member) {
      return errorHandler(
        'User not found with this Id',
        HttpStatus.NOT_FOUND,
        next
      );
    }
    project.members.push(memberId as unknown as UserDocument);
    await project.save();
    member.activeProjects.push(project._id as ProjectDocument);
    await member.save();
    await sendNotification(
      `${req.email} added you to the project`,
      'General',
      member
    );
    res.status(HttpStatus.CREATED).json({
      message: 'Successfully added member to the project',
      project
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

const deleteMemberFromProject: RequestHandler = async (
  req: customRequest,
  res,
  next
) => {
  const { memberId } = req.params as {
    memberId: string;
  };
  const project = req.project as ProjectDocument;

  try {
    const user = await User.findById(memberId);
    if (!user) {
      return errorHandler(
        'User not found with this Id',
        HttpStatus.NOT_FOUND,
        next
      );
    }
    const projectMemberIdx = project.members.findIndex(
      member => member.toString() === user._id?.toString()
    );
    if (projectMemberIdx === -1) {
      return errorHandler(
        'User is not a member of the project already',
        HttpStatus.BAD_REQUEST,
        next
      );
    }
    project.members.splice(projectMemberIdx, 1);
    await project.save();
    const userProjectIdx = user.activeProjects.findIndex(
      activeProject => activeProject.toString() === project._id?.toString()
    );
    if (userProjectIdx === -1) {
      return errorHandler(
        "Project not found in user's active projects",
        HttpStatus.BAD_REQUEST,
        next
      );
    }
    user.activeProjects.splice(userProjectIdx, 1);
    await user.save();
    await sendNotification(
      `${req.email} removed you from the project`,
      'General',
      user
    );
    res.status(HttpStatus.CREATED).json({
      message: 'Successfully removed member from the project',
      project
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

const createSprint: RequestHandler = async (_, res, _1) => {
  res.status(HttpStatus.CREATED).json({
    message: 'Input validation passed, creating sprint'
  });
};

export {
  createProject,
  getJoinRequests,
  requestToJoinProject,
  processJoinRequest,
  addMemberToProject,
  deleteMemberFromProject,
  createSprint
};
