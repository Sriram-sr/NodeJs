import { Router } from 'express';
import {
  signinValidator,
  signupValidator,
  emailOrMobileValidator,
  resetPasswordValidator,
  getUserProfileValidator
} from '../validators/auth-validators';
import {
  signinUser,
  signupUser,
  getAccessToken,
  forgotPasswordHanldler,
  resetPassword,
  getUserProfile
} from '../controllers/auth-controllers';

const router = Router();

router.route('/signup').post(signupValidator, signupUser);
router.route('/signin').post(signinValidator, signinUser);
router.route('/token').post(getAccessToken);
router
  .route('/forgot-password')
  .post(emailOrMobileValidator, forgotPasswordHanldler);
router.route('/reset-password').post(resetPasswordValidator, resetPassword);
router.route('/user/:mobile').get(getUserProfileValidator, getUserProfile);

export default router;
