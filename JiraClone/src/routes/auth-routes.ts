import { Router } from 'express';
import {
  signinValidator,
  signupValidator
} from '../validators/common-validators';
import { signinUser, signupUser } from '../controllers/auth-controllers';

const router = Router();

router.route('/signup').post(signupValidator, signupUser);
router.route('/signin').post(signinValidator, signinUser);

export default router;
