import { Router } from 'express';
import isAuth from '../middlewares/is-auth';
import { createPrValidator } from '../validators/common-validators';
import {
  createPullRequest,
  getPrReviewers
} from '../controllers/pr-controllers';

const router = Router();

router.route('/').post(isAuth, createPrValidator, createPullRequest);
router.route('/:labelName/reviewers').get(getPrReviewers);

export default router;
