import { Router } from 'express';
import { createPost } from '../controllers/post-controllers';
import { createPostValidator } from '../validators/post-validators';
import isAuth from '../middlewares/is-auth';
import imageParser from '../middlewares/image-parser';

const router = Router();

router
  .route('/')
  .post(isAuth, imageParser.single('image'), createPostValidator, createPost);

export default router;
