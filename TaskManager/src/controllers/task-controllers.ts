import { RequestHandler } from 'express';
import { validationResult } from 'express-validator';
import {
  HTTP_STATUS,
  checkValidationErrors,
  errorHandler
} from '../utils/error-handlers';
import { TaskInput, Task } from '../models/Task';
import { customReqBody } from '../middlewares/is-auth';
import Label, { LabelDocument } from '../models/Label';

const getLabelIds = async (labels: string[]): Promise<LabelDocument[]> => {
  const labelDocuments = await Label.find({ labelName: { $in: labels } });
  return labelDocuments.map(label => label._id);
};

// @route    POST /api/v1/task/
// @desc     Creates new task
// @access   Private
export const createTask: RequestHandler = async (
  req: customReqBody,
  res,
  next
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return checkValidationErrors(next, errors.array());
  }
  const { title, description, dueDate, labels, visibility } =
    req.body as TaskInput;
  const labelIds = await getLabelIds(labels);

  Task.create({
    title,
    description,
    labels: labelIds,
    createdBy: req.userId,
    assignedTo: null,
    createdDate: new Date(),
    completionDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    dueDate,
    comments: [],
    collaborators: [],
    visibility
  })
    .then(newTask => {
      res.status(HTTP_STATUS.CREATED).json({
        message: 'Successfully created task',
        newTask
      });
    })
    .catch(err =>
      errorHandler(
        'Something went wrong, could not create task currently',
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        next,
        err
      )
    );
};

// @route    POST /api/v1/task/:taskId
// @desc     Gets a task
// @access   Private
export const getTaskDetails: RequestHandler = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return checkValidationErrors(next, errors.array());
  }
  const { taskId } = req.params as { taskId: string };

  Task.findById(taskId);
}

// @route    POST /api/v1/task/:taskId/assign
// @desc     Assigns a new task
// @access   Private
export const assignTask: RequestHandler = (req: customReqBody, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return checkValidationErrors(next, errors.array());
  }

  if (req.task?.status === 'assigned') {
    return errorHandler(
      'Cannot assign task to more than one user',
      HTTP_STATUS.BAD_REQUEST,
      next
    );
  }
  if (req.userId !== req.task?.createdBy._id.toString()) {
    return errorHandler(
      'Cannot assign task created by others',
      HTTP_STATUS.FORBIDDEN,
      next
    );
  }

  const existingTask = req.user?.assignedTasks.find(
    task => task._id.toString() === req.taskId
  );
  if (existingTask) {
    return errorHandler(
      'Task has already been assigned to the user',
      HTTP_STATUS.BAD_REQUEST,
      next
    );
  }

  req.user?.assignedTasks.unshift(req.task?._id);
  req.user
    ?.save()
    .then(assignedUser => {
      if (req.task) {
        req.task.assignedTo = assignedUser._id;
        req.task.status = 'assigned';
      }
      return req.task?.save();
    })
    .then(assignedTask => {
      res.status(HTTP_STATUS.OK).json({
        message: 'User assigned with the task successfully',
        assignedTask
      });
    })
    .catch(err =>
      errorHandler(
        'Something went wrong, could not assign task currently',
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        next,
        err
      )
    );
};

// @route    DELETE /api/v1/task/:taskId/unassign
// @desc     Unassigns a new task
// @access   Private
export const unassignTask: RequestHandler = (req: customReqBody, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return checkValidationErrors(next, errors.array());
  }

  if (req.userId !== req.task?.createdBy._id.toString()) {
    return errorHandler(
      'Cannot unassign task created by others',
      HTTP_STATUS.FORBIDDEN,
      next
    );
  }

  if (req.task?.status === 'unassigned') {
    return errorHandler(
      'Task has not been assigned to any user',
      HTTP_STATUS.BAD_REQUEST,
      next
    );
  }

  const existingTaskIdx = req.user?.assignedTasks.findIndex(
    task => task._id.toString() === req.taskId
  );
  if (existingTaskIdx && !(existingTaskIdx >= 0)) {
    return errorHandler(
      'User is not previously assigned with this task to unassign',
      HTTP_STATUS.BAD_REQUEST,
      next
    );
  }

  req.user?.assignedTasks.splice(existingTaskIdx!, 1);
  req.user
    ?.save()
    .then(() => {
      if (req.task) {
        req.task.assignedTo = null;
        req.task.status = 'unassigned';
      }
      return req.task?.save();
    })
    .then(unassignedTask => {
      res.status(HTTP_STATUS.OK).json({
        message: 'Successfully unassigned task from the user',
        unassignedTask
      });
    })
    .catch(err =>
      errorHandler(
        'Something went wrong, could not unassign task currently',
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        next,
        err
      )
    );
};

// @route    POST /api/v1/task/:taskId/collaborator
// @desc     Add user as a collaborator for a task.
// @access   Private
export const collaborateTask: RequestHandler = (
  req: customReqBody,
  res,
  next
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return checkValidationErrors(next, errors.array());
  }
  const { userId } = req.body as { userId: string };
  const { taskId } = req.params as { taskId: string };

  const existingUser = req.task?.collaborators.find(
    user => user._id.toString() === userId
  );

  const existingTask = req.user?.collaboratingTasks.find(
    task => task._id.toString() === taskId
  );

  if (existingTask || existingUser) {
    return errorHandler(
      'User is already collaborating to this task',
      HTTP_STATUS.BAD_REQUEST,
      next
    );
  }

  if (req.task?.assignedTo?._id.toString() === userId) {
    return errorHandler(
      'User is already collaborating this task as he is assignee',
      HTTP_STATUS.BAD_REQUEST,
      next
    );
  }

  req.user?.collaboratingTasks.unshift(req.task?._id);
  req.user
    ?.save()
    .then(() => {
      req.task?.collaborators.unshift(req.user?._id);
      return req.task?.save();
    })
    .then(collaboratedtask => {
      res.status(HTTP_STATUS.OK).json({
        message: 'Successfull collaboration to the task',
        collaboratedtask
      });
    })
    .catch(err =>
      errorHandler(
        'Something went wrong, could not collaborate to task currently',
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        next,
        err
      )
    );
};

// @route    DELETE /api/v1/task/:taskId/collaborator
// @desc     Removes collaborator from a task.
// @access   Private
export const removeCollaboratorFromTask: RequestHandler = (
  req: customReqBody,
  res,
  next
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return checkValidationErrors(next, errors.array());
  }
  const { userId } = req.body as { userId: string };
  const { taskId } = req.params as { taskId: string };

  const userIdx = req.task?.collaborators.findIndex(
    user => user._id.toString() === userId
  );

  const taskIdx = req.user?.collaboratingTasks.findIndex(
    task => task._id.toString() === taskId
  );

  if (!(userIdx! >= 0) || !(taskIdx! >= 0)) {
    return errorHandler(
      'User is not a collaborator to remove from collaboration',
      HTTP_STATUS.BAD_REQUEST,
      next
    );
  }

  req.user?.collaboratingTasks.splice(taskIdx!, 1);
  req.user
    ?.save()
    .then(() => {
      req.task?.collaborators.splice(userIdx!, 1);
      return req.task?.save();
    })
    .then(modifiedTask => {
      res.status(200).json({
        message: 'Successfully removed user as a collaborator',
        modifiedTask
      });
    })
    .catch(err =>
      errorHandler(
        'Something went wrong, could not remove collaboration currently',
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        next,
        err
      )
    );
};
