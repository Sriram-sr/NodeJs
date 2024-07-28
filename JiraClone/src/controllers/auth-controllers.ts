import { RequestHandler } from 'express';
import { validationResult } from 'express-validator';
import { hash } from 'bcryptjs';
import {
  HttpStatus,
  inputValidationHandler,
  errorHandler
} from '../utils/error-handlers';
import User from '../models/User';

export const signupUser: RequestHandler = async (req, res, next) => {
  if (!validationResult(req).isEmpty()) {
    return inputValidationHandler(validationResult(req).array(), next);
  }
  const { email, password } = req.body as { email: string; password: string };

  try {
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      return errorHandler(
        'User with this email already exists',
        HttpStatus.CONFLICT,
        next
      );
    }
    const hashedPassword = await hash(password, 2);
    const user = await User.create({
      email: email,
      password: hashedPassword,
      activeProjects: [],
      assignedTasks: [],
      notifications: []
    });
    res.status(HttpStatus.CREATED).json({
      message: 'Successfully registered user',
      user
    });
  } catch (err) {
    errorHandler(
      'Something went wrong, could not signup user currently',
      HttpStatus.INTERNAL_SERVER_ERROR,
      next,
      err
    );
  }
};
