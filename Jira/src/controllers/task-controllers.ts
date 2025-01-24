import { RequestHandler } from 'express';
import { Types } from 'mongoose';
import { validationResult } from 'express-validator';
import {
  errorHandler,
  HttpStatus,
  inputValidationHandler
} from '../utils/error-handlers';
import { Task, TaskDocument, TaskInput } from '../models/Task';
import { Project } from '../models/Project';
import { Sprint } from '../models/Sprint';
import { customRequest } from '../middlewares/is-auth';
import { User } from '../models/User';
import { sendNotification } from '../utils/helper';

const createTask: RequestHandler = async (req: customRequest, res, next) => {
  if (!validationResult(req).isEmpty()) {
    return inputValidationHandler(validationResult(req).array(), next);
  }
  const {
    title,
    description,
    priority,
    dueDate,
    sprintId,
    projectId,
    assignee
  } = req.body as TaskInput;

  try {
    const project = await Project.findById(projectId);
    if (!project) {
      return errorHandler('Project not found', HttpStatus.NOT_FOUND, next);
    }
    const projectMember = project.members.find(
      member => member.toString() === req.userId?.toString()
    );
    if (!projectMember) {
      return errorHandler(
        'Cannot create task if you are not a member of project',
        HttpStatus.FORBIDDEN,
        next
      );
    }
    if (project.status !== 'active') {
      return errorHandler(
        'Cannot create task for a inactive project',
        HttpStatus.BAD_REQUEST,
        next
      );
    }
    const sprint = await Sprint.findById(sprintId);
    if (!sprint) {
      return errorHandler(
        'Sprint not found with the sprint Id',
        HttpStatus.NOT_FOUND,
        next
      );
    }
    const task = await Task.create({
      title: title,
      description: description,
      status: 'Todo',
      priority: priority,
      dueDate: dueDate,
      creator: req.userId,
      sprint: sprint._id,
      assignee: assignee,
      comments: []
    });
    sprint.tasks.unshift(task._id as TaskDocument);
    await sprint.save();
    if (assignee) {
      const assignedUser = await User.findById(assignee);
      if (!assignedUser) {
        return errorHandler(
          'User is not found to assign the task',
          HttpStatus.NOT_FOUND,
          next
        );
      }
      await sendNotification(
        `${req.email} assigned you a new task`,
        'TaskAssignment',
        assignedUser
      );
    }
    res.status(HttpStatus.CREATED).json({
      message: 'Sucessfully created the task',
      task
    });
  } catch (err) {
    errorHandler(
      'Something went wrong, could not create task currently',
      HttpStatus.INTERNAL_SERVER_ERROR,
      next,
      err
    );
  }
};

const getTask: RequestHandler = async (req, res, next) => {
  const { taskId } = req.params as { taskId: string };
  if (!Types.ObjectId.isValid(taskId)) {
    return errorHandler(
      'Task Id is not a valid Mongo Id',
      HttpStatus.UNPROCESSABLE_ENTITY,
      next
    );
  }

  try {
    const task = await Task.findById(taskId)
      .populate({
        path: 'creator',
        select: 'email -_id'
      })
      .populate({
        path: 'assignee',
        select: 'email -_id'
      });
    if (!task) {
      return errorHandler('Task not found', HttpStatus.NOT_FOUND, next);
    }
    res.status(HttpStatus.OK).json({
      message: 'Sucessfully fetched the task',
      task
    });
  } catch (err) {
    errorHandler(
      'Something went wrong, could not get task currently',
      HttpStatus.INTERNAL_SERVER_ERROR,
      next,
      err
    );
  }
};

export { getTask, createTask };
