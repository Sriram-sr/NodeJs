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

// @access  Private
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
      members: [req.userId],
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

// @access Private
const getJoinRequests: RequestHandler = async (
  req: customRequest,
  res,
  next
) => {
  try {
    const project = await req.project?.populate({
      path: 'joinRequests',
      populate: {
        path: 'requester',
        select: 'email'
      }
    });
    res.status(HttpStatus.OK).json({
      message: 'Successfully fetched join requests for the project',
      joinRequests: project?.joinRequests
    });
  } catch (err) {
    errorHandler(
      'Something went wrong, could not get join requests curently',
      HttpStatus.INTERNAL_SERVER_ERROR,
      next,
      err
    );
  }
};

// @access  Private
const requestToJoinProject: RequestHandler = async (
  req: customRequest,
  res,
  next
) => {
  if (!validationResult(req).isEmpty()) {
    return inputValidationHandler(validationResult(req).array(), next);
  }
  const { projectCode } = req.params as { projectCode: string };
  const { reason } = req.body as {
    reason: string;
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

// @access  Private
const approveJoinRequest: RequestHandler = async (
  req: customRequest,
  res,
  next
) => {
  if (!validationResult(req).isEmpty()) {
    return inputValidationHandler(validationResult(req).array(), next);
  }
  const { action } = req.body as {
    action: string;
  };

  try {
    const userRequestIdx = req.project?.joinRequests.findIndex(
      request =>
        request.requester.toString() === req.joinRequester?._id!.toString()
    );
    if (!(userRequestIdx! >= 0)) {
      return errorHandler(
        'User has not requested to join yet',
        HttpStatus.BAD_REQUEST,
        next
      );
    }
    if (action === 'Approve') {
      const requesterId = req.joinRequester?._id as UserDocument;
      req.project?.members.push(requesterId);
      req.project!.joinRequests[userRequestIdx!].status = 'Approved';
      req.joinRequester?.activeProjects.push(req.project?.projectCode!);
      await req.joinRequester?.save();
    } else if (action === 'Decline') {
      req.project!.joinRequests[userRequestIdx!].status = 'Declined';
    }
    await req.project?.save();
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

const addProjectMember: RequestHandler = async (
  req: customRequest,
  res,
  next
) => {
  const { memberId } = req.body as { memberId: UserDocument };
  try {
    const existingMember = req.project?.members.find(
      member => member.toString() === memberId.toString()
    );
    if (existingMember) {
      return errorHandler(
        'User already member of this project',
        HttpStatus.CONFLICT,
        next
      );
    }
    req.project?.members.push(memberId);
    const updatedProject = await req.project?.save();
    res.status(HttpStatus.CREATED).json({
      message: 'Successfully added member to the project',
      updatedProject
    });
  } catch (err) {
    errorHandler(
      'Something went wrong, could not add member curently',
      HttpStatus.INTERNAL_SERVER_ERROR,
      next,
      err
    );
  }
};

const removeProjectMember: RequestHandler = async (
  req: customRequest,
  res,
  next
) => {
  const { memberId } = req.body as { memberId: UserDocument };
  try {
    const existingMemberIdx = req.project?.members.findIndex(
      member => member.toString() === memberId.toString()
    );
    if (!(existingMemberIdx! >= 0)) {
      return errorHandler(
        'User not already present as a member',
        HttpStatus.BAD_REQUEST,
        next
      );
    }
    req.project?.members.splice(existingMemberIdx!, 1);
    const updatedProject = await req.project?.save();
    res.status(HttpStatus.CREATED).json({
      message: 'Successfully added member to the project',
      updatedProject
    });
  } catch (err) {
    errorHandler(
      'Something went wrong, could not add member curently',
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
  approveJoinRequest,
  addProjectMember,
  removeProjectMember
};
