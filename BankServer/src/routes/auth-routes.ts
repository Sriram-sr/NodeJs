import { Router } from 'express';
import { signupUser } from '../controllers/auth-controllers';

const router = Router();

router.route('/signup').get(signupUser);

export default router;
