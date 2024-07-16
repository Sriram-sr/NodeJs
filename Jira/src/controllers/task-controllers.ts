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

export const createTask: RequestHandler = async (
  req: customRequest,
  res,
  next
) => {
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
