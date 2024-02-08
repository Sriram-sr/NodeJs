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
import User from '../models/User';

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

// @route    POST /api/v1/task/:taskId/private
// @desc     Creates new task
// @access   Private
export const assignTask: RequestHandler = (req: customReqBody, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return checkValidationErrors(next, errors.array());
  }
  const serverErrorMsg =
    'Something went wrong, could not assign task currently';
  const { taskId } = req.params as { taskId: string };
  const { userId } = req.body as { userId: string };

  Task.findById(taskId)
    .then(task => {
      if (!task) {
        return errorHandler(
          'Task not found with given task Id',
          HTTP_STATUS.NOT_FOUND,
          next
        );
      }
      if (task.status === 'assigned') {
        return errorHandler(
          'Cannot assign task to more than one user',
          HTTP_STATUS.BAD_REQUEST,
          next
        );
      }
      if (req.userId !== task.createdBy._id.toString()) {
        return errorHandler(
          'Cannot assign task created by others',
          HTTP_STATUS.FORBIDDEN,
          next
        );
      }
      User.findById(userId)
        .then(validUser => {
          if (!validUser) {
            return errorHandler(
              'User with this Id is not found',
              HTTP_STATUS.NOT_FOUND,
              next
            );
          }
          const existingTask = validUser.assignedTasks.find(
            task => task._id.toString() === taskId
          );
          if (existingTask) {
            return errorHandler(
              'Task has already been assigned to the user',
              HTTP_STATUS.BAD_REQUEST,
              next
            );
          }
          validUser.assignedTasks.unshift(task._id);
          validUser
            .save()
            .then(() => {
              task.assignedTo = validUser._id;
              task.status = 'assigned';
              return task.save();
            })
            .then(assignedTask => {
              res.status(HTTP_STATUS.OK).json({
                message: 'User assigned to the task successfully',
                assignedTask
              });
            })
            .catch(err =>
              errorHandler(
                serverErrorMsg,
                HTTP_STATUS.INTERNAL_SERVER_ERROR,
                next,
                err
              )
            );
        })
        .catch(err =>
          errorHandler(
            serverErrorMsg,
            HTTP_STATUS.INTERNAL_SERVER_ERROR,
            next,
            err
          )
        );
    })
    .catch(err =>
      errorHandler(serverErrorMsg, HTTP_STATUS.INTERNAL_SERVER_ERROR, next, err)
    );
};
