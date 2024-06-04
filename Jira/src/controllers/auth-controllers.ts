import { RequestHandler } from 'express';
import { validationResult } from 'express-validator';
import { inputValidationHandler } from '../utils/error-handlers';

export const signupUser: RequestHandler = (req, res, next) => {
  if (!validationResult(req).isEmpty) {
    return inputValidationHandler(validationResult(req).array(), next);
  }

  const { email, password } = req.body as { email: string; password: string };

  console.log(email, password);
};
