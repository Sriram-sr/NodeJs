import { Router } from 'express';
import {
  userIdValidator,
  updateProfileReqValidator,
  followReqValidator
} from '../validators/auth-validators';
import isAuth from '../middlewares/is-auth';
import imageParser from '../middlewares/image-parser';
import {
  getUserProfile,
  updateUserProfile,
  followUser,
  unfollowUser,
  getFollowingUsers,
  getFollowers
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
router.route('/following').get(isAuth, getFollowingUsers);
router.route('/followers').get(isAuth, getFollowers);
router.route('/:userId').get(userIdValidator, getUserProfile);
router.route('/:userId/follow').post(isAuth, followReqValidator, followUser);
router
  .route('/:userId/unfollow')
  .post(isAuth, followReqValidator, unfollowUser);

export default router;
