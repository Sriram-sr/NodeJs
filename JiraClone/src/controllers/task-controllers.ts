import { RequestHandler } from 'express';
import { validationResult } from 'express-validator';
import {
  errorHandler,
  HttpStatus,
  inputValidationHandler
} from '../utils/error-handlers';
import { Task, TaskDocument, TaskInput } from '../models/Task';
import { Counter } from '../middlewares/mongoose-counter';
import { customRequest } from '../middlewares/is-auth';
import { User } from '../models/User';
import { Sprint } from '../models/Sprint';

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
    const taskCounter = await Counter.findOneAndUpdate(
      { modelName: 'Task', fieldName: 'taskId' },
      { $inc: { count: 1 } },
      { new: true }
    );
    const task = await Task.create({
      taskId: taskCounter?.count,
      title,
      description,
      status: 'Todo',
      priority,
      dueDate,
      creator: req._id,
      sprint: sprintId,
      project: projectId,
      assignee,
      comments: []
    });
    if (assignee && assignee.toString() !== req._id?.toString()) {
      const assignedUser = await User.findById(assignee);
      assignedUser?.notifications.push({
        category: 'TaskAssignment',
        message: `${req.email} assigned a task to you`,
        isRead: false,
        createdAt: new Date()
      });
      await assignedUser?.save();
    }
    const sprintOfTask = await Sprint.findById(sprintId);
    sprintOfTask?.tasks.unshift(task._id as TaskDocument);
    await sprintOfTask?.save();
    res.status(HttpStatus.CREATED).json({
      message: 'Successfully created task',
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

export { createTask };
