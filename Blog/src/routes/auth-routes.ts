import { Router } from 'express';
import {
  signupValidator,
  signinValidator,
  userIdValidator,
  updateProfileValidator
} from '../validators/auth-validators';
import isAuth from '../middlewares/is-auth';
import imageParser from '../middlewares/image-parser';
import {
  signupUser,
  signinUser,
  getUserProfile,
  updateUserProfile
} from '../controllers/auth-controllers';

const router = Router();

router.route('/signup').post(signupValidator, signupUser);
router.route('/signin').post(signinValidator, signinUser);
router
  .route('/user')
  .put(
    isAuth,
    imageParser.single('profilePic'),
    updateProfileValidator,
    updateUserProfile
  );
router.route('/user/:userId').get(userIdValidator, getUserProfile);

export default router;
