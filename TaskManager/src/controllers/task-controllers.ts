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

interface getTaskFilters {
  page: string;
  createdBy: string;
  assignedTo: string;
  createdBefore: Date;
  createdAfter: Date;
}

// @route    GET /api/v1/task/
// @desc     Gets all tasks
// @access   Public
const getTasks: RequestHandler = (req, res, next) => {
  const { page, createdBy, assignedTo, createdBefore, createdAfter } =
    req.query as Partial<getTaskFilters>;
  const currentpage = page ?? 1;
  const perPage = 10;
  let filters: Record<string, any> = {};

  if (createdBy) {
    filters = { createdBy: createdBy };
  }

  if (assignedTo) {
    filters = { ...filters, assignedTo: assignedTo };
  }

  if (createdAfter) {
    filters = { ...filters, createdDate: { $gt: new Date(createdAfter) } };
  }
  if (createdBefore) {
    filters = {
      ...filters,
      createdDate: { ...filters.createdDate, $lt: new Date(createdBefore) }
    };
  }

  Task.find(filters)
    .skip((+currentpage - 1) * perPage)
    .limit(perPage)
    .then(tasks => {
      res.status(HTTP_STATUS.OK).json({
        message: 'Sucessfully fetched tasks',
        tasks
      });
    })
    .catch(err =>
      errorHandler(
        'Something went wrong, could not get tasks currently',
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        next,
        err
      )
    );
};

// @route    POST /api/v1/task/
// @desc     Creates new task
// @access   Private
const createTask: RequestHandler = async (req: customReqBody, res, next) => {
  const validationErrors = validationResult(req);
  if (!validationErrors.isEmpty()) {
    return checkValidationErrors(next, validationErrors.array());
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
// @desc     Gets task details
// @access   Private
const getTaskDetails: RequestHandler = (req: customReqBody, res, next) => {
  const validationErrors = validationResult(req);
  if (!validationErrors.isEmpty()) {
    return checkValidationErrors(next, validationErrors.array());
  }
  const { taskId } = req.params as { taskId: string };

  Task.findById(taskId)
    .populate({
      path: 'labels',
      select: 'labelName -_id'
    })
    .populate({
      path: 'createdBy assignedTo collaborators',
      select: 'username'
    })
    .populate({
      path: 'comments',
      select: 'text commentedBy date',
      populate: {
        path: 'commentedBy',
        select: 'username -_id'
      }
    })
    .then(task => {
      const colloboratorIds = task?.collaborators.map(collaborator =>
        collaborator._id.toString()
      );

      if (task?.visibility === 'private') {
        if (
          !colloboratorIds?.includes(req.userId as any) &&
          task.createdBy._id.toString() !== req.userId &&
          task.assignedTo?._id.toString() !== req.userId
        ) {
          return errorHandler(
            'Private tasks can only be viewed by collaborators/creators of the task',
            HTTP_STATUS.FORBIDDEN,
            next
          );
        }
      }
      res.status(HTTP_STATUS.OK).json({
        message: 'Successfully fetched task',
        task
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

// @route    PATCH /api/v1/task/status/:taskId
// @desc     Updates task status
// @access   Private
const updateTaskStatus: RequestHandler = (req: customReqBody, res, next) => {
  const validationErrors = validationResult(req);
  if (!validationErrors.isEmpty()) {
    return checkValidationErrors(next, validationErrors.array());
  }
  const { status } = req.body as { status: string };

  if (status === req.task?.status) {
    return errorHandler(
      `Task is already in ${status} state`,
      HTTP_STATUS.BAD_REQUEST,
      next
    );
  }

  if (status === 'assigned') {
    return errorHandler(
      'Cannot change task state to assigned without assigning a user',
      HTTP_STATUS.BAD_REQUEST,
      next
    );
  }

  if (
    status === 'unassigned' &&
    req.task?.assignedTo?._id.toString() !== req.userId
  ) {
    return errorHandler(
      'Cannot unassign a task assigned to other user',
      HTTP_STATUS.FORBIDDEN,
      next
    );
  }

  if (req.task) {
    if (status === 'unassigned') {
      req.task.status = status;
      req.task.assignedTo = null;
    } else {
      req.task.status = status;
    }
  }
  req.task
    ?.save()
    .then(updatedTask => {
      res.status(HTTP_STATUS.OK).json({
        message: `Successfully changed task status to ${status}`,
        updatedTask
      });
    })
    .catch(err =>
      errorHandler(
        'Something went wrong, could not change status of task currently',
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        next,
        err
      )
    );
};

// @route    POST /api/v1/task/:taskId/assign
// @desc     Assigns a new task
// @access   Private
const assignTask: RequestHandler = (req: customReqBody, res, next) => {
  const validationErrors = validationResult(req);
  if (!validationErrors.isEmpty()) {
    return checkValidationErrors(next, validationErrors.array());
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
const unassignTask: RequestHandler = (req: customReqBody, res, next) => {
  const validationErrors = validationResult(req);
  if (!validationErrors.isEmpty()) {
    return checkValidationErrors(next, validationErrors.array());
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
const collaborateTask: RequestHandler = (req: customReqBody, res, next) => {
  const validationErrors = validationResult(req);
  if (!validationErrors.isEmpty()) {
    return checkValidationErrors(next, validationErrors.array());
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
const removeCollaboratorFromTask: RequestHandler = (
  req: customReqBody,
  res,
  next
) => {
  const validationErrors = validationResult(req);
  if (!validationErrors.isEmpty()) {
    return checkValidationErrors(next, validationErrors.array());
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
      res.status(HTTP_STATUS.OK).json({
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

// @route    DELETE /api/v1/task/:taskId/comment
// @desc     Comments on a task.
// @access   Private
const commentOnTask: RequestHandler = (req: customReqBody, res, next) => {
  const validationErrors = validationResult(req);
  if (!validationErrors.isEmpty()) {
    return checkValidationErrors(next, validationErrors.array());
  }
  const { text: commentText } = req.body as { text: string };

  if (req.task?.visibility === 'private') {
    if (
      !req.task?.collaborators.includes(req.userId as any) &&
      req.task?.assignedTo?._id.toString() !== req.userId &&
      req.task.createdBy._id.toString() !== req.userId
    ) {
      return errorHandler(
        'User should not comment on private task unless collaborator/creator',
        HTTP_STATUS.FORBIDDEN,
        next
      );
    }
  }

  req.task?.comments.unshift({
    text: commentText,
    commentedBy: req.userId as any,
    date: new Date()
  });
  req.task
    ?.save()
    .then(task => {
      res.status(HTTP_STATUS.OK).json({
        message: 'Sucessfully commented on the task',
        task
      });
    })
    .catch(err =>
      errorHandler(
        'Something went wrong, could not comment currently',
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        next,
        err
      )
    );
};

// @route    PATCH /api/v1/task/:taskId/label/:labeId
// @desc     Adds a label to task.
// @access   Private
const addLabelToTask: RequestHandler = (req: customReqBody, res, next) => {
  const validationErrors = validationResult(req);
  if (!validationErrors.isEmpty()) {
    return checkValidationErrors(next, validationErrors.array());
  }
  const { labelId } = req.params as { labelId: string; taskId: string };

  const existingLabel = req.task?.labels.find(
    label => label._id.toString() === labelId
  );
  if (existingLabel) {
    return errorHandler(
      'Label already exists in the task',
      HTTP_STATUS.CONFLICT,
      next
    );
  }
  req.task?.labels.push(req.label?._id);
  req.task
    ?.save()
    .then(task => {
      res.status(HTTP_STATUS.OK).json({
        message: 'Successfully added label to the task',
        task
      });
    })
    .catch(err =>
      errorHandler(
        'Something went wrong, could not add label currently',
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        next,
        err
      )
    );
};

// @route    DELETE /api/v1/task/:taskId/label/:labeId
// @desc     Remove a label from task.
// @access   Private
const removeLabelFromTask: RequestHandler = (req: customReqBody, res, next) => {
  const validationErrors = validationResult(req);
  if (!validationErrors.isEmpty()) {
    return checkValidationErrors(next, validationErrors.array());
  }
  const { labelId } = req.params as { labelId: string; taskId: string };

  const existingLabelIdx = req.task?.labels.findIndex(
    label => label._id.toString() === labelId
  );
  if (!(existingLabelIdx! >= 0)) {
    return errorHandler(
      'Label not present in the task to remove',
      HTTP_STATUS.BAD_REQUEST,
      next
    );
  }
  req.task?.labels.splice(existingLabelIdx!, 1);
  req.task
    ?.save()
    .then(task => {
      res.status(HTTP_STATUS.OK).json({
        message: 'Successfully removed label from the task',
        task
      });
    })
    .catch(err =>
      errorHandler(
        'Something went wrong, could not remove label currently',
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        next,
        err
      )
    );
};

export {
  getTasks,
  getTaskDetails,
  createTask,
  updateTaskStatus,
  assignTask,
  unassignTask,
  collaborateTask,
  removeCollaboratorFromTask,
  commentOnTask,
  addLabelToTask,
  removeLabelFromTask
};
