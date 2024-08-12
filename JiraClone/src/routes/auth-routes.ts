import { Router } from 'express';
import {
  emailValidator,
  resetPasswordValidator,
  signinValidator,
  signupValidator
} from '../validators/common-validators';
import {
  forgotPasswordHandler,
  getUsers,
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
router.route('/users').get(getUsers);

export default router;
