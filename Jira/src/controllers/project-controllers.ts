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

export const createProject: RequestHandler = async (
  req: customRequest,
  res,
  next
) => {
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
      members: [],
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
