import { RequestHandler } from 'express';
import { validationResult } from 'express-validator';
import {
  HttpStatus,
  errorHandler,
  validationErrorHandler
} from '../utils/error-handlers';
import Post from '../models/Post';
import { CustomRequest } from '../middlewares/is-auth';
import Hashtag from '../models/Hashtag';

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

    const hashtags = content.match(/#[a-zA-Z0-9]+/g) || [];
    if (hashtags?.length > 0) {
      hashtags.map(async tag => {
        const existingHashtag = await Hashtag.findOne({ tagName: tag });
        if (existingHashtag) {
          existingHashtag.posts.push(post._id);
          await existingHashtag.save();
        } else {
          await Hashtag.create({ tagName: tag, posts: [post._id] });
        }
      });
    }

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
