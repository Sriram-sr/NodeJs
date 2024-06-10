import { RequestHandler } from 'express';
import { validationResult } from 'express-validator';
import { compare, hash } from 'bcryptjs';
import { sign } from 'jsonwebtoken';
import {
  HttpStatus,
  errorHandler,
  inputValidationHandler
} from '../utils/error-handlers';
import { User } from '../models/User';
import { JWTSECUREKEY, JWTEXPIRY } from '../utils/constants';

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

const signinUser: RequestHandler = async (req, res, next) => {
  if (!validationResult(req).isEmpty()) {
    return inputValidationHandler(validationResult(req).array(), next);
  }
  const { email, password } = req.body as { email: string; password: string };

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return errorHandler(
        'User not found with this email',
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
    const token = sign({ email: user.email, _id: user._id }, JWTSECUREKEY, {
      expiresIn: JWTEXPIRY
    });
    res.status(HttpStatus.OK).json({
      message: 'Successfully signed in',
      token
    });
  } catch (err) {
    errorHandler(
      'Something went wrong, could not login user currently',
      HttpStatus.INTERNAL_SERVER_ERROR,
      next,
      err
    );
  }
};

export { signupUser, signinUser };
