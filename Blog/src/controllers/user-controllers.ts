import { RequestHandler } from 'express';
import { validationResult } from 'express-validator';
import { CustomRequest } from '../middlewares/is-auth';
import User from '../models/User';
import {
  HttpStatus,
  errorHandler,
  validationErrorHandler
} from '../utils/error-handlers';

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
      'Something went wrong, could not update profile currently',
      HttpStatus.INTERNAL_SERVER_ERROR,
      next,
      err
    );
  }
};

// @access  Private
export const followUser: RequestHandler = async (
  req: CustomRequest,
  res,
  next
) => {
  if (!validationResult(req).isEmpty()) {
    return validationErrorHandler(validationResult(req).array(), next);
  }

  try {
    if (req.userId?.toString() === req.userToFollow?._id.toString()) {
      return errorHandler(
        'User cannot follow themselves',
        HttpStatus.BAD_REQUEST,
        next
      );
    }
    const user = await User.findById(req.userId);
    if (req.userToFollow) {
      const existingFollower = user?.following.find(
        follower => follower._id.toString() === req.userToFollow?._id.toString()
      );
      if (existingFollower) {
        return errorHandler(
          'You already follow this user',
          HttpStatus.CONFLICT,
          next
        );
      }
      req.userToFollow.followers.unshift(req.userId!);
      await req.userToFollow.save();
      user?.following.unshift(req.userToFollow._id);
      const updatedUser = await user?.save();

      res.status(HttpStatus.OK).json({
        message: 'Successfully followed user',
        updatedUser
      });
    }
  } catch (err) {
    errorHandler(
      'Something went wrong, could not follow user currently',
      HttpStatus.INTERNAL_SERVER_ERROR,
      next,
      err
    );
  }
};
