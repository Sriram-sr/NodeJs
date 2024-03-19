import { Router } from 'express';
import {
  signupValidator,
  signinValidator,
  userIdValidator
} from '../validators/auth-validators';
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
  .route('/user/:userId')
  .get(userIdValidator, getUserProfile)
  .put(imageParser.single('profilePic'), updateUserProfile);
// Get User Profile
// Update User Profile

export default router;
