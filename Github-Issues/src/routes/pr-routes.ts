import { Router } from 'express';
import isAuth from '../middlewares/is-auth';
import {
  createPRValidator,
  commentOnPRValidator,
  requestReviewValidator
} from '../validators/pr-validators';
import {
  createPullRequest,
  getPRReviewers,
  commentOnPR,
  requestReview
} from '../controllers/pr-controllers';

const router = Router();

router.route('/').post(isAuth, createPRValidator, createPullRequest);
router.route('/:labelName/reviewers').get(getPRReviewers);
router.route('/:prId/comment').post(isAuth, commentOnPRValidator, commentOnPR);
router.route('/:prId/review').put(isAuth, requestReviewValidator, requestReview);

export default router;
