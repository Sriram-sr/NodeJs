import { Router } from 'express';
import { signupValidator } from '../validators/auth-validators';
import { signupUser } from '../controllers/auth-controllers';

const router = Router();

router.route('/signup').post(signupValidator, signupUser);

export default router;
