import { RequestHandler } from 'express';
import { validationResult } from 'express-validator';
import {
  errorHandler,
  HttpStatus,
  inputValidationHandler
} from '../utils/error-handlers';
import { Task, TaskDocument, TaskInput } from '../models/Task';
import { customRequest } from '../middlewares/is-auth';
import { Sprint } from '../models/Sprint';
import { Project } from '../models/Project';
import { Counter } from '../middlewares/mongoose-counter';
import { UserDocument } from '../models/User';

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
      return errorHandler(
        'Project not found for creating task',
        HttpStatus.NOT_FOUND,
        next
      );
    }
    const projectMember = project.members.find(
      member => member._id?.toString() === req.userId?.toString()
    );
    if (!projectMember) {
      return errorHandler(
        'Cannot create a task in the project unless you are a member',
        HttpStatus.FORBIDDEN,
        next
      );
    }
    const sprint = await Sprint.findById(sprintId);
    if (!sprint) {
      return errorHandler(
        'Sprint not found for creating task',
        HttpStatus.NOT_FOUND,
        next
      );
    }
    const taskCounter = await Counter.findOneAndUpdate(
      { modelName: 'Task', field: 'taskId' },
      { $inc: { count: 1 } },
      { new: true }
    );

    const task: TaskDocument = await Task.create({
      taskId: `TS${taskCounter?.count}`,
      title,
      description,
      status: 'Todo',
      priority,
      dueDate,
      creator: req.userId,
      sprint: sprintId,
      project: projectId,
      assignee,
      comments: []
    });
    const taskId = task._id as TaskDocument;
    sprint.tasks.unshift(taskId);
    await sprint.save();
    res.status(HttpStatus.CREATED).json({
      message: 'Successfully created a task',
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

const getSingleTask: RequestHandler = async (req, res, next) => {
  if (!validationResult(req).isEmpty()) {
    return inputValidationHandler(validationResult(req).array(), next);
  }
  const { taskId } = req.params as { taskId: string };

  try {
    const task = await Task.findOne({ taskId: taskId });
    // TODO: Extract assignee and creator email and test negative scenario
    if (!task) {
      return errorHandler(
        'Task not found with this Id',
        HttpStatus.NOT_FOUND,
        next
      );
    }
    res.status(HttpStatus.OK).json({
      message: 'Successfully fetched task',
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

const assignTask: RequestHandler = async (req: customRequest, res, next) => {
  if (!validationResult(req).isEmpty()) {
    return inputValidationHandler(validationResult(req).array(), next);
  }
  const { assignee } = req.body as { assignee: UserDocument };
  const { taskId } = req.params as { taskId: string };

  try {
    const task = await Task.findOne({ taskId: taskId });
    if (!task) {
      return errorHandler(
        'Task not found with this Id',
        HttpStatus.NOT_FOUND,
        next
      );
    }
    const taskProject = await Project.findById(task.project);
    if (!taskProject || taskProject.status === 'inactive') {
      return errorHandler(
        'Cannot assign as task project is inactive/unavailable',
        HttpStatus.BAD_REQUEST,
        next
      );
    }
    const projectMember = taskProject.members.find(
      member => member._id?.toString() === req.userId?.toString()
    );
    if (!projectMember) {
      return errorHandler(
        'Cannot assign task to anyone if you are not project member',
        HttpStatus.FORBIDDEN,
        next
      );
    }
    task.assignee = assignee;
    await task.save();
    // TODO: To add assigned task in user collection and notification part
    res.status(HttpStatus.OK).json({
      message: 'Successfully assigned task'
    });
  } catch (err) {
    errorHandler(
      'Something went wrong, could not assign task currently',
      HttpStatus.INTERNAL_SERVER_ERROR,
      next,
      err
    );
  }
};

export { createTask, getSingleTask, assignTask };
