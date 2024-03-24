import { Router } from 'express';
import {
  userIdValidator,
  updateProfileReqValidator,
  followUserReqValidator
} from '../validators/auth-validators';
import isAuth from '../middlewares/is-auth';
import imageParser from '../middlewares/image-parser';
import {
    followUser,
  getUserProfile,
  updateUserProfile
} from '../controllers/user-controllers';

const router = Router();

router
  .route('/')
  .put(
    isAuth,
    imageParser.single('profilePic'),
    updateProfileReqValidator,
    updateUserProfile
  );
router.route('/:userId').get(userIdValidator, getUserProfile);
router.route('/:userId/follow').post(isAuth, followUserReqValidator, followUser);

export default router;
