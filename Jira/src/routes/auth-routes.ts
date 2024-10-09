import { Router } from 'express';
import {
  forgotPasswordHandler,
  resetPasswordHandler,
  signinUser,
  signupUser
} from '../controllers/auth-controllers';

const router = Router();

router.route('/signup').post(signupUser);
router.route('/signin').post(signinUser);
router.route('/forgot-password').post(forgotPasswordHandler);
router.route('/reset-password').post(resetPasswordHandler);

export default router;