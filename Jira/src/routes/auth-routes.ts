import { Router } from 'express';
import {
  emailValidator,
  resetPasswordValidator,
  signinValidator,
  signupValidator
} from '../validators/auth-validators';
import {
  forgotPasswordHandler,
  resetPasswordHandler,
  signinUser,
  signupUser
} from '../controllers/auth-controllers';

const router = Router();

router.route('/signup').post(signupValidator, signupUser);
router.route('/signin').post(signinValidator, signinUser);
router.route('/forgot-password').post(emailValidator, forgotPasswordHandler);
router
  .route('/reset-password')
  .post(resetPasswordValidator, resetPasswordHandler);
router.route('/user');

export default router;
