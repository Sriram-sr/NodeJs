import { RequestHandler } from 'express';
import { validationResult } from 'express-validator';
import {
  HttpStatus,
  errorHandler,
  validationErrorHandler
} from '../utils/error-handlers';
import Post, { PostDocument } from '../models/Post';
import { CustomRequest } from '../middlewares/is-auth';
import Hashtag from '../models/Hashtag';
import User from '../models/User';

const createHashtag = async (content: string, post: PostDocument) => {
  const hashtags = content.match(/#[a-zA-Z0-9]+/g) || [];
  if (hashtags?.length > 0) {
    hashtags.map(async tag => {
      if (tag.length <= 15) {
        const existingHashtag = await Hashtag.findOne({ tagName: tag });
        if (existingHashtag) {
          const existingPost = existingHashtag.posts.find(
            post => post._id.toString() === post._id.toString()
          );
          if (!existingPost) {
            existingHashtag.posts.push(post._id);
            await existingHashtag.save();
          }
        } else {
          await Hashtag.create({ tagName: tag, posts: [post._id] });
        }
      }
    });
  }
};

// @access  Private
export const createPost: RequestHandler = async (
  req: CustomRequest,
  res,
  next
) => {
  if (!validationResult(req).isEmpty()) {
    return validationErrorHandler(validationResult(req).array(), next);
  }
  const { title, content } = req.body as { title: string; content: string };
  let imageUrl: string | undefined;
  if (req.file) {
    imageUrl = req.file.path;
  }

  try {
    const post = await Post.create({
      title,
      content,
      imageUrl,
      creator: req.userId,
      likes: [],
      comments: [],
      reposts: []
    });

    await createHashtag(content, post);
    const user = await User.findById(req.userId);
    user?.posts.unshift(post._id);
    await user?.save();

    res.status(HttpStatus.CREATED).json({
      message: 'Successfully created post',
      post
    });
  } catch (err) {
    errorHandler(
      'Something went wrong, could not post currently',
      HttpStatus.INTERNAL_SERVER_ERROR,
      next,
      err
    );
  }
};

// @access  Public
export const getHashtagPosts: RequestHandler = async (req, res, next) => {
  if (!validationResult(req).isEmpty()) {
    return validationErrorHandler(validationResult(req).array(), next);
  }
  const { tag } = req.params as { tag: string };

  try {
    if (tag.length > 15) {
      return errorHandler(
        'Enter a valid Hashtag',
        HttpStatus.UNPROCESSABLE_ENTITY,
        next
      );
    }

    const hashtag = await Hashtag.findOne({ tagName: `#${tag}` }).populate({
      path: 'posts',
      select: 'creator title content'
    });

    if (!hashtag) {
      return errorHandler('Hashtag not found', HttpStatus.NOT_FOUND, next);
    }

    res.status(HttpStatus.OK).json({
      message: 'Sucessfully fetched posts',
      posts: hashtag.posts
    });
  } catch (err) {
    errorHandler(
      'Something went wrong, could not get posts currently',
      HttpStatus.INTERNAL_SERVER_ERROR,
      next,
      err
    );
  }
};

// @access  Public
export const getPost: RequestHandler = async (req, res, next) => {
  if (!validationResult(req).isEmpty()) {
    return validationErrorHandler(validationResult(req).array(), next);
  }
  const { postId } = req.params as { postId: string };

  try {
    const post = await Post.findById(postId).populate({
      path: 'creator',
      select: 'username -_id'
    });

    if (!post) {
      return errorHandler(
        'Post not found with this Id',
        HttpStatus.NOT_FOUND,
        next
      );
    }
    // TODO Extract comments and Likes based on further requirements.
    res.status(HttpStatus.OK).json({
      messsage: 'Successfully fetched post',
      post
    });
  } catch (err) {
    errorHandler(
      'Something went wrong, could not get post currently',
      HttpStatus.INTERNAL_SERVER_ERROR,
      next,
      err
    );
  }
};

// @access  Private
export const updatePost: RequestHandler = async (
  req: CustomRequest,
  res,
  next
) => {
  if (!validationResult(req).isEmpty()) {
    return validationErrorHandler(validationResult(req).array(), next);
  }
  const { content } = req.body as { content: string };
  const { postId } = req.params as { postId: string };

  try {
    const post = await Post.findById(postId);

    if (!post) {
      return errorHandler(
        'Post not found with this Id',
        HttpStatus.NOT_FOUND,
        next
      );
    }

    if (post.creator._id.toString() !== req.userId?.toString()) {
      return errorHandler(
        'Cannot update post created by others',
        HttpStatus.FORBIDDEN,
        next
      );
    }
    post.content = content;
    await createHashtag(content, post);
    const updatedPost = await post.save();

    res.status(HttpStatus.OK).json({
      messsage: 'Sucessfully updated the post',
      updatedPost
    });
  } catch (err) {
    errorHandler(
      'Something went wrong, could not update post currently',
      HttpStatus.INTERNAL_SERVER_ERROR,
      next,
      err
    );
  }
};

// @access  Private
export const likePost: RequestHandler = async (
  req: CustomRequest,
  res,
  next
) => {
  if (!validationResult(req).isEmpty()) {
    return validationErrorHandler(validationResult(req).array(), next);
  }
  const { postId } = req.params as { postId: string };

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return errorHandler(
        'Post not found with this Id',
        HttpStatus.NOT_FOUND,
        next
      );
    }

    const existingLike = post.likes.find(
      user => user._id.toString() === req.userId?.toString()
    );
    if (existingLike) {
      return errorHandler(
        'User already liked this post',
        HttpStatus.CONFLICT,
        next
      );
    }

    post.likes.unshift(req.userId!);
    const likedPost = await post.save();

    res.status(HttpStatus.OK).json({
      message: 'Successfully liked the post',
      likedPost
    });
  } catch (err) {
    errorHandler(
      'Something went wrong, could not like post currently',
      HttpStatus.INTERNAL_SERVER_ERROR,
      next,
      err
    );
  }
};
