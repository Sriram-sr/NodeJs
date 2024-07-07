import { Router } from 'express';
import {
  emailValidator,
  resetPasswordValidator,
  signinValidator,
  signupValidator
} from '../validators/auth-validators';
import {
  forgotPasswordHandler,
  getNotifications,
  getUsers,
  resetPasswordHandler,
  signinUser,
  signupUser
} from '../controllers/auth-controllers';
import isAuth from '../middlewares/is-auth';

const router = Router();

router.route('/signup').post(signupValidator, signupUser);
router.route('/signin').post(signinValidator, signinUser);
router.route('/forgot-password').post(emailValidator, forgotPasswordHandler);
router
  .route('/reset-password')
  .post(resetPasswordValidator, resetPasswordHandler);
router.route('/user/notifications').get(isAuth, getNotifications);
router.route('/user').get(getUsers);

export default router;
