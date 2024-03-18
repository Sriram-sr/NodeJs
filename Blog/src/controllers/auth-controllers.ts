import { RequestHandler, Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { hash, compare } from 'bcryptjs';
import { sign } from 'jsonwebtoken';
import User, { UserInput } from '../models/User';
import { JWTSECUREKEY, JWTEXPIRYTIME } from '../utils/env-variables';
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

export const signinUser: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!validationResult(req).isEmpty()) {
    return validationErrorHandler(validationResult(req).array(), next);
  }
  const { email, username, password } = req.body as UserInput;

  try {
    const user = await User.findOne({
      $or: [{ email: email }, { username: username }]
    });

    if (!user) {
      return errorHandler(
        'User not found with this email/username',
        HttpStatus.NOT_FOUND,
        next
      );
    }

    const isMatch = await compare(password, user.password);

    if (!isMatch) {
      return errorHandler(
        'Password does not match',
        HttpStatus.UNAUTHORIZED,
        next
      );
    }
    const token = sign(
      { email: user.email, username: user.username, _id: user._id },
      JWTSECUREKEY,
      { expiresIn: JWTEXPIRYTIME }
    );

    res.status(HttpStatus.OK).json({
      message: 'Successfully logged in',
      token,
      user
    });
  } catch (err) {
    errorHandler(
      'Something went wrong, could not signin currently',
      HttpStatus.INTERNAL_SERVER_ERROR,
      next,
      err
    );
  }
};
