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
import { Sprint, SprintDocument } from '../models/Sprint';

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

  try {
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
      requester?.activeProjects.unshift(req.project?._id as ProjectDocument);
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

  try {
    const existingMember = req.project?.members.find(
      member => member.toString() === req.projectMember?._id?.toString()
    );
    if (existingMember) {
      return errorHandler(
        'User is already a project member',
        HttpStatus.CONFLICT,
        next
      );
    }
    req.project?.members.push(req.projectMember?._id as UserDocument);
    await req.project?.save();
    req.projectMember?.activeProjects.unshift(
      req.project?._id as ProjectDocument
    );
    req.projectMember?.notifications.push({
      category: 'General',
      message: `${req.email} added you as a member of a project`,
      isRead: false,
      createdAt: new Date()
    });
    await req.projectMember?.save();
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

const removeMember: RequestHandler = async (req: customRequest, res, next) => {
  if (!validationResult(req).isEmpty()) {
    return inputValidationHandler(validationResult(req).array(), next);
  }

  try {
    const existingMemberIdx = req.project?.members.findIndex(
      member => member.toString() === req.projectMember?._id?.toString()
    );
    if (!(existingMemberIdx! >= 0)) {
      return errorHandler(
        'User is not a project member already to remove',
        HttpStatus.BAD_REQUEST,
        next
      );
    }
    req.project?.members.splice(existingMemberIdx!, 1);
    req.projectMember?.notifications.push({
      category: 'General',
      message: `${req.email} removed you as a member from the project`,
      isRead: false,
      createdAt: new Date()
    });
    const projectToRemoveIdx = req.projectMember?.activeProjects.findIndex(
      project => project.toString() === req.project?._id?.toString()
    );
    if (!(projectToRemoveIdx! >= 0)) {
      return errorHandler(
        "Project not found in member's active projects",
        HttpStatus.NOT_FOUND,
        next
      );
    }
    req.projectMember?.activeProjects.splice(projectToRemoveIdx!, 1);
    await req.project?.save();
    await req.projectMember?.save();
    res.status(HttpStatus.OK).json({
      message: 'Successfully removed member from the project'
    });
  } catch (err) {
    errorHandler(
      'Something went wrong, could not remove member currently',
      HttpStatus.INTERNAL_SERVER_ERROR,
      next,
      err
    );
  }
};

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
    const sprintCounter = await Counter.findOneAndUpdate(
      { modelName: 'Sprint', fieldName: 'sprintId' },
      { $inc: { count: 1 } },
      { new: true }
    );
    const sprint = await Sprint.create({
      sprintId: sprintCounter?.count,
      title,
      goal,
      startDate,
      endDate,
      project: req.project?._id,
      tasks: []
    });
    req.project?.sprints.unshift(sprint._id as SprintDocument);
    req.project?.members.map(async (member: UserDocument) => {
      if (member.toString() !== req.project?.creator.toString()) {
        const memberToNotify = await User.findById(member);
        memberToNotify?.notifications.push({
          category: 'SprintStartEnd',
          message: `${req.email} created new sprint for the project ${req.project?.projectCode} where you are a member`,
          isRead: false,
          createdAt: new Date()
        });
        await memberToNotify?.save();
      }
    });
    await req.project?.save();
    res.status(HttpStatus.CREATED).json({
      message: 'Successfully created sprint',
      sprint
    });
  } catch (err) {
    errorHandler(
      'Something went wrong, could not create sprint currently',
      HttpStatus.INTERNAL_SERVER_ERROR,
      next,
      err
    );
  }
};

const getSprint: RequestHandler = async (req: customRequest, res, next) => {
  const { sprintId } = req.params as { sprintId: string };
  const { page } = req.query as { page?: number };
  const currentPage = page || 1;
  const perPage = 5;
  const skip = (currentPage - 1) * perPage;
  const limit = skip + perPage;

  try {
    const projectMember = req.project?.members.find(
      member => member.toString() === req._id?.toString()
    );
    if (req.project?.visibility === 'private' && !projectMember) {
      return errorHandler(
        'Only member of private project can view the sprint',
        HttpStatus.FORBIDDEN,
        next
      );
    }
    const sprint = await Sprint.findById(sprintId).populate({
      path: 'tasks',
      select: 'title'
    });
    if (!sprint) {
      return errorHandler(
        'Sprint not found with this Id',
        HttpStatus.NOT_FOUND,
        next
      );
    }
    sprint.tasks = sprint.tasks.slice(skip, limit);
    res.status(HttpStatus.OK).json({
      message: 'Successfully fetched sprint',
      sprint
    });
  } catch (err) {
    errorHandler(
      'Something went wrong, could not get sprint currently',
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
  addMember,
  removeMember,
  createSprint,
  getSprint
};
