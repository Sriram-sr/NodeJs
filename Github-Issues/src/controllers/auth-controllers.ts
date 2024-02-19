import { RequestHandler } from 'express';
import { validationResult } from 'express-validator';
import { compare, hash } from 'bcryptjs';
import { sign } from 'jsonwebtoken';
import {
  errorHandler,
  HttpStatus,
  validationErrorHandler
} from '../utils/error-handlers';
import { JWTSECUREKEY, JWT_EXPIRY_TIME } from '../utils/env-variables';
import User from '../models/User';

export const signupUser: RequestHandler = async (req, res, next) => {
  const validationErrors = validationResult(req);
  if (!validationErrors.isEmpty()) {
    return validationErrorHandler(validationErrors.array(), next);
  }
  const { email, username, password } = req.body as {
    email: string;
    username: string;
    password: string;
  };

  try {
    const hashedPassword = await hash(password, 2);
    const newUser = await User.create({
      email,
      username,
      password: hashedPassword
    });

    res.status(HttpStatus.CREATED).json({
      message: 'Successfully registered user',
      newUser
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

export const signinUser: RequestHandler = async (req, res, next) => {
  const validationErrors = validationResult(req);
  if (!validationErrors.isEmpty()) {
    return validationErrorHandler(validationErrors.array(), next);
  }
  const { email, username, password } = req.body as {
    email?: string;
    username?: string;
    password: string;
  };

  try {
    const user = await User.findOne({
      $or: [{ username: username }, { email: email }]
    });
    if (!user) {
      return errorHandler(
        'User not found with the given username/email',
        HttpStatus.NOT_FOUND,
        next
      );
    }
    const isPasswordMatch = await compare(password, user.password);
    if (!isPasswordMatch) {
      return errorHandler(
        'Password is incorrect',
        HttpStatus.UNAUTHORIZED,
        next
      );
    }
    const token = sign(
      {
        email: user.email,
        username: user.username,
        userId: user._id
      },
      JWTSECUREKEY,
      { expiresIn: JWT_EXPIRY_TIME }
    );

    res.status(HttpStatus.OK).json({
      message: 'Successfully signed in user',
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
