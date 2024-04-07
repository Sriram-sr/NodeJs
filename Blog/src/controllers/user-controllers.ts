import { RequestHandler } from 'express';
import { validationResult } from 'express-validator';
import { CustomRequest } from '../middlewares/is-auth';
import User, { Activity, UserDocument } from '../models/User';
import {
  HttpStatus,
  errorHandler,
  validationErrorHandler
} from '../utils/error-handlers';
import { paginateData } from './post-controllers';

export const clearUserActivity = async (
  user: UserDocument,
  activity: Activity
) => {
  if (user.lastActivities.length >= 5) {
    user.lastActivities.splice(4, 1);
  }
  user.lastActivities.unshift(activity);
  await user.save();
};

// @access Public
export const getUserProfile: RequestHandler = async (req, res, next) => {
  if (!validationResult(req).isEmpty()) {
    return validationErrorHandler(validationResult(req).array(), next);
  }
  const { userId } = req.params as { userId: string };

  try {
    const profile = await User.findById(userId)
      .select(
        'username email profilePic about posts following followers lastActivities'
      )
      .lean();

    const { posts, followers, following, ...customProfile } =
      profile as UserDocument;
    customProfile.postsCount = profile?.posts.length;
    customProfile.followersCount = profile?.followers.length;
    customProfile.followingCount = profile?.following.length;

    if (!profile) {
      return errorHandler(
        'User not found with this Id',
        HttpStatus.NOT_FOUND,
        next
      );
    }
    res.status(HttpStatus.OK).json({
      message: 'Successfully fetched User profile',
      customProfile
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
  try {
    const user = await User.findById(req.userId)
      .select('following -_id')
      .populate({
        path: 'following',
        select: 'username -_id'
      });

    res.status(HttpStatus.OK).json({
      message: 'Sucessfully fetched following users',
      followingUsers: paginateData(req, user?.following!)
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
  try {
    const user = await User.findById(req.userId)
      .select('followers -_id')
      .populate({
        path: 'followers',
        select: 'username -_id'
      });

    res.status(HttpStatus.OK).json({
      message: 'Sucessfully fetched followers',
      followingUsers: paginateData(req, user?.followers!)
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

// @acess  Private
export const getSuggestedUsers: RequestHandler = async (
  req: CustomRequest,
  res,
  next
) => {
  type IndirectFollowee = {
    _id?: UserDocument;
    username: string;
  };

  try {
    const user = await User.findById(req.userId)
      .select('following -_id')
      .populate({
        path: 'following',
        select: 'following',
        populate: {
          path: 'following',
          select: 'username'
        }
      });

    const userFollowingIds = user?.following.map(followee =>
      followee._id.toString()
    );
    const followersOfFollowers: Array<IndirectFollowee> = [];
    user?.following.forEach(followee => {
      followee.following.forEach(indirectFollowee => {
        followersOfFollowers.push(indirectFollowee);
      });
    });

    let suggestedFollowees;
    let isPaginated = false;
    suggestedFollowees = followersOfFollowers.filter(
      followee =>
        !userFollowingIds?.includes(followee._id?.toString()) &&
        followee._id?.toString() !== req.userId?.toString()
    );

    if (!(suggestedFollowees.length >= 1)) {
      const [skip, limit] = paginateData(req) as [number, number];
      suggestedFollowees = await User.find({})
        .select('username')
        .skip(skip)
        .limit(limit);
      isPaginated = true;
    }

    if (!isPaginated)
      suggestedFollowees = paginateData(req, suggestedFollowees);

    res.status(HttpStatus.OK).json({
      message: 'Successfully fetched suggested followees',
      suggestedFollowees
    });
  } catch (err) {
    errorHandler(
      'Something went wrong, could not get suggested users currently',
      HttpStatus.INTERNAL_SERVER_ERROR,
      next,
      err
    );
  }
};
