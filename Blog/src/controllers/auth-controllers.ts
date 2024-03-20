import { RequestHandler } from 'express';
import { validationResult } from 'express-validator';
import { hash, compare } from 'bcryptjs';
import { sign } from 'jsonwebtoken';
import { CustomRequest } from '../middlewares/is-auth';
import User, { UserInput } from '../models/User';
import { JWTSECUREKEY, JWTEXPIRYTIME } from '../utils/env-variables';
import {
  HttpStatus,
  errorHandler,
  validationErrorHandler
} from '../utils/error-handlers';

// @access Public
export const signupUser: RequestHandler = async (req, res, next) => {
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

// @access Public
export const signinUser: RequestHandler = async (req, res, next) => {
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
      { email: user.email, username: user.username, userId: user._id },
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

// @access Public
export const getUserProfile: RequestHandler = async (req, res, next) => {
  if (!validationResult(req).isEmpty()) {
    return validationErrorHandler(validationResult(req).array(), next);
  }
  const { userId } = req.params as { userId: string };

  try {
    const profile = await User.findById(userId).select(
      'username email profilePic about'
    ); // TODO more fields to get and populate

    if (!profile) {
      return errorHandler(
        'User not found with this Id',
        HttpStatus.NOT_FOUND,
        next
      );
    }
    res.status(HttpStatus.OK).json({
      message: 'Successfully fetched User profile',
      profile
    });
  } catch (err) {
    errorHandler(
      'Something went wrong, could not get profile currently',
      HttpStatus.INTERNAL_SERVER_ERROR,
      next,
      err
    );
  }
};

// @access  Private
export const updateUserProfile: RequestHandler = async (
  req: CustomRequest,
  res,
  next
) => {
  if (!validationResult(req).isEmpty()) {
    return validationErrorHandler(validationResult(req).array(), next);
  }
  const { about } = req.body as { about?: string };

  try {
    const profile = await User.findById(req.userId);

    if (!profile) {
      return errorHandler(
        'User not found with this Id',
        HttpStatus.NOT_FOUND,
        next
      );
    }

    if (req.file) {
      profile.profilePic = req.file.path;
    }

    if (about) profile.about = about;

    const updatedProfile = await profile.save();

    res.status(HttpStatus.OK).json({
      message: 'Successfully updated profile',
      updatedProfile
    });
  } catch (err) {
    errorHandler(
      'Something went wrong, could not upadate profile currently',
      HttpStatus.INTERNAL_SERVER_ERROR,
      next,
      err
    );
  }
};
