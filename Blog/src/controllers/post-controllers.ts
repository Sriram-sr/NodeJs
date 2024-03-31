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
import User, { UserDocument } from '../models/User';
import Comment, { Reply } from '../models/Comment';

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

const validatePost: RequestHandler = async (req: CustomRequest, _, next) => {
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

    req.post = post;
    next();
  } catch (err) {
    errorHandler(
      'Something went wrong, could not perform this post action currently',
      HttpStatus.INTERNAL_SERVER_ERROR,
      next,
      err
    );
  }
};

export const validateComment: RequestHandler = async (
  req: CustomRequest,
  _,
  next
) => {
  if (!validationResult(req).isEmpty()) {
    return validationErrorHandler(validationResult(req).array(), next);
  }
  const { commentId } = req.params as { commentId: string };

  try {
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return errorHandler(
        'Comment not found with this Id',
        HttpStatus.NOT_FOUND,
        next
      );
    }
    req.comment = comment;
    next();
  } catch (err) {
    errorHandler(
      'Something went wrong, could not perform this commenyt action currently',
      HttpStatus.INTERNAL_SERVER_ERROR,
      next,
      err
    );
  }
};

// @access  Private
const createPost: RequestHandler = async (req: CustomRequest, res, next) => {
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
      comments: []
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
const getHashtagPosts: RequestHandler = async (req, res, next) => {
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
const getPost: RequestHandler = async (req: CustomRequest, res, next) => {
  try {
    const post = await req.post?.populate({
      path: 'creator',
      select: 'username -_id'
    });
    const customPost = post?.toObject();
    customPost.likesCount = customPost.likes.length;
    customPost.commentsCount = customPost.comments.length;
    delete customPost.likes;
    delete customPost.comments;

    res.status(HttpStatus.OK).json({
      messsage: 'Successfully fetched post',
      customPost
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

// @access  Public
const getPostLikes: RequestHandler = async (req: CustomRequest, res, next) => {
  const { page } = req.query as { page?: number };
  const currentPage = page || 1;
  const perPage = 10;
  const skip = (currentPage - 1) * perPage;
  const limit = skip + perPage;
  try {
    const post = await req.post?.populate({
      path: 'likes',
      select: 'username -_id'
    });
    const likes = post?.likes.slice(skip, limit);

    res.status(HttpStatus.OK).json({
      message: 'Successfully fetched post likes',
      likes
    });
  } catch (err) {
    errorHandler(
      'Something went wrong, could not get post likes currently',
      HttpStatus.INTERNAL_SERVER_ERROR,
      next,
      err
    );
  }
};

// @access  Public
const getPostComments: RequestHandler = async (
  req: CustomRequest,
  res,
  next
) => {
  // TODO: get comment replies route(Extract)
  const { page } = req.query as { page?: number };
  const currentPage = page || 1;
  const perPage = 10;
  const skip = (currentPage - 1) * perPage;
  const limit = skip + perPage;
  interface CustomComment {
    commentedBy: UserDocument;
    text: string;
    likes?: Array<UserDocument>;
    likesCount?: number;
  }

  try {
    const post = await req.post?.populate({
      path: 'comments',
      select: 'commentedBy text likes',
      populate: {
        path: 'commentedBy',
        select: 'username -_id'
      }
    });
    const postComments: Array<CustomComment> = post
      ?.toObject()
      .comments.map((comment: CustomComment) => {
        const optimisedComment = {
          ...comment,
          likesCount: comment.likes?.length
        };
        delete optimisedComment.likes;
        return optimisedComment;
      });
    res.status(HttpStatus.OK).json({
      message: 'Successfully fetched post comments',
      comments: postComments.slice(skip, limit)
    });
  } catch (err) {
    errorHandler(
      'Something went wrong, could not get post comments currently',
      HttpStatus.INTERNAL_SERVER_ERROR,
      next,
      err
    );
  }
};

// @access  Private
const editPost: RequestHandler = async (req: CustomRequest, res, next) => {
  const { content } = req.body as { content: string };

  try {
    if (req.post?.creator._id.toString() !== req.userId?.toString()) {
      return errorHandler(
        'Cannot update post created by others',
        HttpStatus.FORBIDDEN,
        next
      );
    }
    if (req.post) {
      req.post.content = content;
      await createHashtag(content, req.post);
      const editedPost = await req.post.save();

      res.status(HttpStatus.OK).json({
        messsage: 'Sucessfully updated the post',
        editedPost
      });
    }
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
const deletePost: RequestHandler = async (req: CustomRequest, res, next) => {
  if (req.userId?.toString() !== req.post?.creator.toString()) {
    return errorHandler(
      'Cannot delete posts created by other users',
      HttpStatus.FORBIDDEN,
      next
    );
  }

  const user = await User.findById(req.userId);
  const postIdx = user?.posts.findIndex(
    post => post._id.toString() === req.post?._id.toString()
  );
  if (postIdx! >= 0) {
    user?.posts.splice(postIdx!, 1);
    await user?.save();
  }
  await Comment.deleteMany({ post: req.post?._id });
  await req.post?.deleteOne();

  res.status(HttpStatus.OK).json({
    message: 'Successfully deleted post'
  });
};

// @access  Private
const likePost: RequestHandler = async (req: CustomRequest, res, next) => {
  try {
    const existingLike = req.post?.likes.find(
      user => user._id.toString() === req.userId?.toString()
    );
    if (existingLike) {
      return errorHandler(
        'User already liked this post',
        HttpStatus.CONFLICT,
        next
      );
    }

    req.post?.likes.unshift(req.userId!);
    const likedPost = await req.post?.save();

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

// @access  Private
const unlikePost: RequestHandler = async (req: CustomRequest, res, next) => {
  try {
    const existingLikeIdx = req.post?.likes.findIndex(
      user => user._id.toString() === req.userId?.toString()
    );

    if (!(existingLikeIdx! >= 0)) {
      return errorHandler(
        'User not already liked this post to unlike',
        HttpStatus.BAD_REQUEST,
        next
      );
    }

    req.post?.likes.splice(existingLikeIdx!, 1);
    const unlikedPost = await req.post?.save();

    res.status(HttpStatus.OK).json({
      message: 'Successfully unliked post',
      unlikedPost
    });
  } catch (err) {
    errorHandler(
      'Something went wrong, could not unlike post currently',
      HttpStatus.INTERNAL_SERVER_ERROR,
      next,
      err
    );
  }
};

// @access  Private
const commentOnPost: RequestHandler = async (req: CustomRequest, res, next) => {
  const { text } = req.body as { text: string };

  try {
    const comment = await Comment.create({
      post: req.post?._id,
      commentedBy: req.userId,
      text,
      likes: [],
      replies: []
    });

    req.post?.comments.unshift(comment._id);
    const commentedPost = await req.post?.save();

    res.status(HttpStatus.CREATED).json({
      message: 'Successfully commented on post',
      commentedPost
    });
  } catch (err) {
    errorHandler(
      'Something went wrong, could not comment on post currently',
      HttpStatus.INTERNAL_SERVER_ERROR,
      next,
      err
    );
  }
};

// @acess  Private
const likeAComment: RequestHandler = async (req: CustomRequest, res, next) => {
  try {
    const existingLike = req.comment?.likes.find(
      user => user._id.toString() === req.userId?.toString()
    );

    if (existingLike) {
      return errorHandler(
        'User already liked this comment',
        HttpStatus.CONFLICT,
        next
      );
    }
    req.comment?.likes.unshift(req.userId!);
    const likedComment = await req.comment?.save();

    res.status(HttpStatus.OK).json({
      message: 'Successfully liked the comment',
      likedComment
    });
  } catch (err) {
    errorHandler(
      'Something went wrong, could not like the comment currently',
      HttpStatus.INTERNAL_SERVER_ERROR,
      next,
      err
    );
  }
};

// @acess  Private
const unlikeAComment: RequestHandler = async (
  req: CustomRequest,
  res,
  next
) => {
  try {
    const existingLikeIdx = req.comment?.likes.findIndex(
      user => user._id.toString() === req.userId?.toString()
    );

    if (!(existingLikeIdx! >= 0)) {
      return errorHandler(
        'User not liked this comment already to unlike',
        HttpStatus.BAD_REQUEST,
        next
      );
    }
    req.comment?.likes.splice(existingLikeIdx!, 1);
    const unlikedComment = await req.comment?.save();

    res.status(HttpStatus.OK).json({
      message: 'Successfully unliked the comment',
      unlikedComment
    });
  } catch (err) {
    errorHandler(
      'Something went wrong, could not unlike the comment currently',
      HttpStatus.INTERNAL_SERVER_ERROR,
      next,
      err
    );
  }
};

// @access  Private
const replyToComment: RequestHandler = async (
  req: CustomRequest,
  res,
  next
) => {
  const { text } = req.body as { text: string };
  try {
    const reply: Reply = {
      repliedBy: req.userId!,
      text: text
    };
    req.comment?.replies.unshift(reply);
    const updatedComment = await req.comment?.save();

    res.status(HttpStatus.CREATED).json({
      message: 'Successfully replied to the comment',
      updatedComment
    });
  } catch (err) {
    errorHandler(
      'Something went wrong, could not reply to the comment currently',
      HttpStatus.INTERNAL_SERVER_ERROR,
      next,
      err
    );
  }
};

export {
  validatePost,
  createPost,
  getHashtagPosts,
  getPost,
  getPostLikes,
  getPostComments,
  editPost,
  deletePost,
  likePost,
  unlikePost,
  commentOnPost,
  likeAComment,
  unlikeAComment,
  replyToComment
};
