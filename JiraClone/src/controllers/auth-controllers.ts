import { RequestHandler } from 'express';
import { validationResult } from 'express-validator';
import { compare, hash } from 'bcryptjs';
import { sign } from 'jsonwebtoken';
import {
  HttpStatus,
  inputValidationHandler,
  errorHandler
} from '../utils/error-handlers';
import { generateToken, User } from '../models/User';
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

const forgotPasswordHandler: RequestHandler = async (req, res, next) => {
  const { email } = req.body as { email: string };

  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      return errorHandler(
        'No user exists with this email',
        HttpStatus.NOT_FOUND,
        next
      );
    }
    const token = await generateToken(32);
    user.resetPasswordToken = token;
    user.resetPasswordExpiry = new Date(Date.now() + 3600000);
    await user.save();
    res.status(HttpStatus.OK).json({
      message: 'Successfully generated token for resetting password',
      token
    });
  } catch (err) {
    errorHandler(
      'Something went wrong, could not reset password currently',
      HttpStatus.INTERNAL_SERVER_ERROR,
      next,
      err
    );
  }
};

const resetPasswordHandler: RequestHandler = async (req, res, next) => {
  const { password, token } = req.body as {
    password: string;
    token: string;
  };

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiry: { $gt: new Date(Date.now()) }
    });
    if (!user) {
      return errorHandler(
        'User not found with this token or token may be expired',
        HttpStatus.UNAUTHORIZED,
        next
      );
    }
    const newPassword = await hash(password, 2);
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;
    await user.save();
    res.status(HttpStatus.OK).json({
      message: 'Successfully changed password'
    });
  } catch (err) {
    errorHandler(
      'Something went wrong, could not reset password currently',
      HttpStatus.INTERNAL_SERVER_ERROR,
      next,
      err
    );
  }
};

const getUsers: RequestHandler = async (req, res, next) => {
  const { page } = req.query as { page?: number };
  const currentPage = page || 1;
  const perPage = 10;

  try {
    const users = await User.find()
      .select('email')
      .skip((currentPage - 1) * perPage)
      .limit(perPage);
    res.status(HttpStatus.OK).json({
      message: 'Successfully fetched users',
      users
    });
  } catch (err) {
    errorHandler(
      'Something went wrong, could not get users currently',
      HttpStatus.INTERNAL_SERVER_ERROR,
      next,
      err
    );
  }
};

export {
  signupUser,
  signinUser,
  forgotPasswordHandler,
  resetPasswordHandler,
  getUsers
};
