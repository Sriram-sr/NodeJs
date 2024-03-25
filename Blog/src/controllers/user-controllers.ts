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
    if (req.userId?.toString() === req.followUser?._id.toString()) {
      return errorHandler(
        'User cannot follow themselves',
        HttpStatus.BAD_REQUEST,
        next
      );
    }
    const user = await User.findById(req.userId);
    if (req.followUser) {
      const existingFollowing = user?.following.find(
        follower => follower._id.toString() === req.followUser?._id.toString()
      );
      const existingFollower = req.followUser.followers.find(
        follower => follower._id.toString() === req.userId?.toString()
      );

      if (existingFollowing || existingFollower) {
        return errorHandler(
          'You already follow this user',
          HttpStatus.CONFLICT,
          next
        );
      }

      req.followUser.followers.unshift(req.userId!);
      await req.followUser.save();
      user?.following.unshift(req.followUser._id);
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

// @access  Private
export const unfollowUser: RequestHandler = async (
  req: CustomRequest,
  res,
  next
) => {
  if (!validationResult(req).isEmpty()) {
    return validationErrorHandler(validationResult(req).array(), next);
  }

  try {
    if (req.userId?.toString() === req.followUser?._id.toString()) {
      return errorHandler(
        'User cannot unfollow themselves',
        HttpStatus.BAD_REQUEST,
        next
      );
    }
    const user = await User.findById(req.userId);
    const existingFollowingIdx = user?.following.findIndex(
      follower => follower._id.toString() === req.followUser?._id.toString()
    );

    const existingFollowerIdx = req.followUser?.followers.findIndex(
      follower => follower._id.toString() === req.userId?.toString()
    );
    if (!(existingFollowingIdx! >= 0) || !(existingFollowerIdx! >= 0)) {
      return errorHandler(
        'You are not already following this user to unfollow',
        HttpStatus.BAD_REQUEST,
        next
      );
    }

    req.followUser?.followers.splice(existingFollowerIdx!, 1);
    await req.followUser?.save();
    user?.following.splice(existingFollowingIdx!, 1);
    const updatedUser = await user?.save();

    res.status(HttpStatus.OK).json({
      message: 'Successfuly unfollowed user',
      updatedUser
    });
  } catch (err) {
    errorHandler(
      'Something went wrong, could not unfollow user currently',
      HttpStatus.INTERNAL_SERVER_ERROR,
      next,
      err
    );
  }
};

// @access  Private
export const getFollowingUsers: RequestHandler = async (
  req: CustomRequest,
  res,
  next
) => {
  const { page } = req.query as { page?: number };
  const currentPage = page || 1;
  const perPage = 10;
  const skip = (currentPage - 1) * perPage;
  const limit = (currentPage - 1) * perPage + perPage;

  try {
    const user = await User.findById(req.userId)
      .select('following -_id')
      .populate({
        path: 'following',
        select: 'username -_id'
      });

    res.status(HttpStatus.OK).json({
      message: 'Sucessfully fetched following users',
      followingUsers: user?.following.slice(skip, limit)
    });
  } catch (err) {
    errorHandler(
      'Something went wrong, could not get following users currently',
      HttpStatus.INTERNAL_SERVER_ERROR,
      next,
      err
    );
  }
};

// @access  Private
export const getFollowers: RequestHandler = async (
  req: CustomRequest,
  res,
  next
) => {
  const { page } = req.query as { page?: number };
  const currentPage = page || 1;
  const perPage = 10;
  const skip = (currentPage - 1) * perPage;
  const limit = (currentPage - 1) * perPage + perPage;

  try {
    const user = await User.findById(req.userId)
      .select('followers -_id')
      .populate({
        path: 'followers',
        select: 'username -_id'
      });

    res.status(HttpStatus.OK).json({
      message: 'Sucessfully fetched followers',
      followingUsers: user?.followers.slice(skip, limit)
    });
  } catch (err) {
    errorHandler(
      'Something went wrong, could not get followers currently',
      HttpStatus.INTERNAL_SERVER_ERROR,
      next,
      err
    );
  }
};
