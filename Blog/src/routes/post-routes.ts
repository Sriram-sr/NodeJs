import { Router } from 'express';
import { createPost, getHashtagPosts } from '../controllers/post-controllers';
import { createPostValidator } from '../validators/post-validators';
import isAuth from '../middlewares/is-auth';
import imageParser from '../middlewares/image-parser';

const router = Router();

router
  .route('/')
  .post(isAuth, imageParser.single('image'), createPostValidator, createPost);
router.route('/hashtag/:tag').get(getHashtagPosts);

export default router;
