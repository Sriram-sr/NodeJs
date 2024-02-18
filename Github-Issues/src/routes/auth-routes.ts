import { Router } from 'express';
import { signupValidator, signinValidator } from '../validators/auth-validators';
import { signupUser, signinUser } from '../controllers/auth-controllers';

const router = Router();

router.route('/signup').post(signupValidator, signupUser);
router.route('/signin').post(signinValidator, signinUser);

export default router;
