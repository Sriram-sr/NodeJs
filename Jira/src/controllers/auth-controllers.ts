import { RequestHandler } from 'express';
import { validationResult } from 'express-validator';
import {
  HttpStatus,
  errorHandler,
  inputValidationHandler
} from '../utils/error-handlers';
import { User } from '../models/User';
import { hash } from 'bcryptjs';

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
    const newUser = await User.create({
      email: email,
      password: hashedPassword,
      notifications: []
    });
    res.status(HttpStatus.CREATED).json({
      message: 'Successfully registered user',
      newUser
    });
  } catch (err) {
    errorHandler(
      'Something went wrong, could not register user currently',
      HttpStatus.INTERNAL_SERVER_ERROR,
      next,
      err
    );
  }
};
