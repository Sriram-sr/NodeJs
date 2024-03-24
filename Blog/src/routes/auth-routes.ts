import { Router } from 'express';
import {
  signupReqValidator,
  signinReqValidator
} from '../validators/auth-validators';
import { signupUser, signinUser } from '../controllers/auth-controllers';

const router = Router();

router.route('/signup').post(signupReqValidator, signupUser);
router.route('/signin').post(signinReqValidator, signinUser);

export default router;
