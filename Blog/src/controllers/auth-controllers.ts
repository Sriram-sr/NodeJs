import { RequestHandler, Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { hash } from 'bcryptjs';
import User, { UserInput } from '../models/User';
import {
  HttpStatus,
  errorHandler,
  validationErrorHandler
} from '../utils/error-handlers';

export const signupUser: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!validationResult(req).isEmpty()) {
    return validationErrorHandler(validationResult(req).array(), next);
  }
  const { email, username, password } = req.body as UserInput;

  try {
    const hashedPassword = await hash(password, 2);
    const user = await User.create({
      email,
      username,
      password: hashedPassword,
      posts: [],
      followers: [],
      following: [],
      lastActivities: []
    });

    res.status(HttpStatus.CREATED).json({
      message: 'Successfully registered user',
      user
    });
  } catch (err) {
    errorHandler(
      'Something went wrong, could not signup currently',
      HttpStatus.INTERNAL_SERVER_ERROR,
      next,
      err
    );
  }
};
