import { Router } from 'express';
import {
  signinValidator,
  signupValidator
} from '../validators/auth-validators';
import {
  getAccessToken,
  signinUser,
  signupUser
} from '../controllers/auth-controllers';

const router = Router();

router.route('/signup').post(signupValidator, signupUser);
router.route('/signin').post(signinValidator, signinUser);
router.route('/token').post(getAccessToken);

export default router;
