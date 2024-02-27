import { Router } from 'express';
import isAuth from '../middlewares/is-auth';
import { createPrValidator } from '../validators/common-validators';
import { createPullRequest } from '../controllers/pr-controllers';

const router = Router();

router.route('/').post(isAuth, createPrValidator, createPullRequest);

export default router;
