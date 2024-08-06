import { RequestHandler } from 'express';
import { validationResult } from 'express-validator';
import {
  errorHandler,
  HttpStatus,
  inputValidationHandler
} from '../utils/error-handlers';
import { Counter } from '../middlewares/mongoose-counter';
import { customRequest } from '../middlewares/is-auth';
import { Project } from '../models/Project';

export const createProject: RequestHandler = async (
  req: customRequest,
  res,
  next
) => {
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
