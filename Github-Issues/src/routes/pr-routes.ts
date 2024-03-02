import { Router } from 'express';
import isAuth from '../middlewares/is-auth';
import {
  getPRValidator,
  createPRValidator,
  commentOnPRValidator,
  requestReviewValidator,
  prIdValidator
} from '../validators/pr-validators';
import {
  getSinglePR,
  getPullRequests,
  createPullRequest,
  getPRReviewers,
  commentOnPR,
  requestReview,
  approvePR,
  mergePR
} from '../controllers/pr-controllers';

const router = Router();

router
  .route('/')
  .get(getPullRequests)
  .post(isAuth, createPRValidator, createPullRequest);
router.route('/:prId').get(getPRValidator, getSinglePR);
router.route('/:labelName/reviewers').get(getPRReviewers, getSinglePR);
router.route('/:prId/comment').post(isAuth, commentOnPRValidator, commentOnPR);
router
  .route('/:prId/review')
  .put(isAuth, requestReviewValidator, requestReview);
router.route('/:prId/approve').patch(isAuth, prIdValidator, approvePR);
router.route('/:prId/merge').put(isAuth, prIdValidator, mergePR);

export default router;
