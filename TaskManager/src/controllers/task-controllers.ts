import { RequestHandler } from 'express';

// @route    POST /api/v1/task/
// @desc     Creates new task
// @access   Private
export const createTask: RequestHandler = (_, res, _1) => {
  res.status(201).json({
    message: 'Validating middleware'
  });
};
