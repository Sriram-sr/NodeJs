import { Router } from 'express';
import {
  createPost,
  getHashtagPosts,
  getPost,
  updatePost,
  likePost
} from '../controllers/post-controllers';
import {
  createPostValidator,
  postIdValidator,
  postContentValidator
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
  .put(isAuth, postContentValidator, updatePost);
router.route('/hashtag/:tag').get(getHashtagPosts);
router.route('/:postId/like').post(isAuth, postIdValidator, likePost);

export default router;
