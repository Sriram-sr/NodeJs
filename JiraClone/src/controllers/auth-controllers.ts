import { RequestHandler } from 'express';
import { validationResult } from 'express-validator';
import { compare, hash } from 'bcryptjs';
import { sign } from 'jsonwebtoken';
import {
  HttpStatus,
  inputValidationHandler,
  errorHandler
} from '../utils/error-handlers';
import { User } from '../models/User';
import { JWT_EXPIRY_TIME, JWT_SECURE_KEY } from '../utils/constants';

const signupUser: RequestHandler = async (req, res, next) => {
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

const signinUser: RequestHandler = async (req, res, next) => {
  if (!validationResult(req).isEmpty()) {
    return inputValidationHandler(validationResult(req).array(), next);
  }
  const { email, password } = req.body as { email: string; password: string };

  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      return errorHandler(
        'No user exists with this email',
        HttpStatus.NOT_FOUND,
        next
      );
    }
    const isPasswordMatch = await compare(password, user.password);
    if (!isPasswordMatch) {
      return errorHandler(
        'Password do not match',
        HttpStatus.UNAUTHORIZED,
        next
      );
    }
    const token = sign({ email: user.email, _id: user._id }, JWT_SECURE_KEY, {
      expiresIn: JWT_EXPIRY_TIME
    });
    res.status(HttpStatus.OK).json({
      message: 'Successfully logged in',
      token
    });
  } catch (err) {
    errorHandler(
      'Something went wrong, could not signin user currently',
      HttpStatus.INTERNAL_SERVER_ERROR,
      next,
      err
    );
  }
};

export { signupUser, signinUser };
