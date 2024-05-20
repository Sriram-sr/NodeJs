import { Router } from 'express';
import { isAdminOrStaff } from '../middlewares/common-middlewares';
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
  getUserProfile,
  getStaffs
} from '../controllers/auth-controllers';
import { isAuth } from '../middlewares/is-auth';

const router = Router();

router.route('/signup').post(signupValidator, signupUser);
router.route('/signin').post(signinValidator, signinUser);
router.route('/token').post(getAccessToken);
router
  .route('/forgot-password')
  .post(emailOrMobileValidator, forgotPasswordHanldler);
router.route('/reset-password').post(resetPasswordValidator, resetPassword);
router.route('/user/:mobile').get(getUserProfileValidator, getUserProfile);
router.route('/staff').get(isAuth, isAdminOrStaff, getStaffs);

export default router;
