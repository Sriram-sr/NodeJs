import { Router } from 'express';
import isAuth from '../middlewares/is-auth';
import {
  signupValidator,
  signinValidator
} from '../validators/auth-validators';
import {
  signupUser,
  signinUser,
  getUsers
} from '../controllers/auth-controllers';

const router = Router();

router.route('/signup').post(signupValidator, signupUser);
router.route('/signin').post(signinValidator, signinUser);
router.route('/users').get(isAuth, getUsers);

export default router;
