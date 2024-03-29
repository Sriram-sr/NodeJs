import { Router } from 'express';
import {
  validatePost,
  createPost,
  getHashtagPosts,
  getPost,
  updatePost,
  likePost,
  unlikePost,
  commentOnPost,
  validateComment,
  likeAComment,
  unlikeAComment
} from '../controllers/post-controllers';
import {
  createPostValidator,
  postIdValidator,
  postContentValidator,
  postCommentValidator,
  commentIdValidator
} from '../validators/post-validators';
import isAuth from '../middlewares/is-auth';
import imageParser from '../middlewares/image-parser';

const router = Router();

router
  .route('/')
  .post(isAuth, imageParser.single('image'), createPostValidator, createPost);
router
  .route('/:postId')
  .get(postIdValidator, getPost)
  .put(isAuth, postIdValidator, postContentValidator, validatePost, updatePost);
router
  .route('/:postId/like')
  .post(isAuth, postIdValidator, validatePost, likePost);
router
  .route('/:postId/unlike')
  .delete(isAuth, postIdValidator, validatePost, unlikePost);
router
  .route('/:postId/comment')
  .post(isAuth, postCommentValidator, validatePost, commentOnPost);
router.route('/hashtag/:tag').get(getHashtagPosts);
router
  .route('/comment/:commentId/like')
  .post(isAuth, commentIdValidator, validateComment, likeAComment);
router
  .route('/comment/:commentId/unlike')
  .delete(isAuth, commentIdValidator, validateComment, unlikeAComment);

export default router;
