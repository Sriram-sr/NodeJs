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
import { User, UserDocument } from '../models/User';
import { Sprint } from '../models/Sprint';

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
    const projectCounter = await Counter.findOneAndUpdate(
      { modelName: 'Project', field: 'projectId' },
      { $inc: { count: 1 } },
      { new: true }
    );
    const project = await Project.create({
      projectCode: `${projectCodePrefix}${projectCounter?.count}`,
      title,
      description,
      visibility,
      creator: req.userId,
      members: [req.userId],
      joinRequests: [],
      sprints: [],
      status:'active'
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
    const projectCreator = await User.findById(project.creator);
    projectCreator?.notifications.unshift({
      category: 'General',
      status: 'unread',
      message: `${req.email} requested to join project ${project.projectCode}`,
      createdAt: new Date(Date.now())
    });
    await projectCreator?.save();
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
      req.joinRequester?.notifications.unshift({
        category: 'General',
        status: 'unread',
        message: `Your request to join project ${req.project?.projectCode} has been approved`,
        createdAt: new Date(Date.now())
      });
    } else if (action === 'Decline') {
      req.project!.joinRequests[userRequestIdx!].status = 'Declined';
      req.joinRequester?.notifications.unshift({
        category: 'General',
        status: 'unread',
        message: `Your request to join project ${req.project?.projectCode} has been declined`,
        createdAt: new Date(Date.now())
      });
    }
    await req.joinRequester?.save();
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

// @access  Private
const addProjectMember: RequestHandler = async (
  req: customRequest,
  res,
  next
) => {
  if (!validationResult(req).isEmpty()) {
    return inputValidationHandler(validationResult(req).array(), next);
  }
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
    const projectMember = await User.findById(memberId);
    projectMember?.notifications.unshift({
      category: 'General',
      status: 'unread',
      message: `You were added as a member of project ${req.project?.projectCode}`,
      createdAt: new Date(Date.now())
    });
    await projectMember?.save();
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

// @access  Private
const removeProjectMember: RequestHandler = async (
  req: customRequest,
  res,
  next
) => {
  if (!validationResult(req).isEmpty()) {
    return inputValidationHandler(validationResult(req).array(), next);
  }
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
    const projectMember = await User.findById(memberId);
    projectMember?.notifications.unshift({
      category: 'General',
      status: 'unread',
      message: `You were removed from project ${req.project?.projectCode}`,
      createdAt: new Date(Date.now())
    });
    await projectMember?.save();
    req.project?.members.splice(existingMemberIdx!, 1);
    const updatedProject = await req.project?.save();
    res.status(HttpStatus.CREATED).json({
      message: 'Successfully removed member from the project',
      updatedProject
    });
  } catch (err) {
    errorHandler(
      'Something went wrong, could not remove member curently',
      HttpStatus.INTERNAL_SERVER_ERROR,
      next,
      err
    );
  }
};

// @access  Private
const createSprint: RequestHandler = async (req: customRequest, res, next) => {
  if (!validationResult(req).isEmpty()) {
    return inputValidationHandler(validationResult(req).array(), next);
  }
  const { title, goal, startDate, endDate } = req.body as {
    title: string;
    goal: string;
    startDate: Date;
    endDate: Date;
  };

  try {
    const projectMember = req.project?.members.find(
      member => member.toString() === req.userId?.toString()
    );
    if (!projectMember) {
      return errorHandler(
        'Only members of the project are allowed to create sprints',
        HttpStatus.FORBIDDEN,
        next
      );
    }
    const sprintCounter = await Counter.findOneAndUpdate(
      { modelName: 'Sprint', field: 'sprintId' },
      { $inc: { count: 1 } },
      { new: true }
    );
    const newSprint = await Sprint.create({
      sprintId: `SP${sprintCounter?.count}`,
      title,
      startDate,
      endDate,
      goal,
      creator: req.userId,
      project: req.project?._id,
      tasks: []
    });
    req.project?.sprints.push(newSprint);
    await req.project?.save();
    res.status(HttpStatus.CREATED).json({
      message: 'Successfully created a sprint',
      newSprint
    });
  } catch (err) {
    errorHandler(
      'Something went wrong, could not create sprint curently',
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
  removeProjectMember,
  createSprint
};
