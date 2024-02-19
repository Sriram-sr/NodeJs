import { Router } from 'express';
import isAuth from '../middlewares/is-auth';
import {
  createIssueValidator,
  assignValidator,
  commentValidator,
  addLabelValidator
} from '../validators/issue-validators';
import {
  createIssue,
  assignUser,
  commentOnIssue,
  addLabelOnIssue
} from '../controllers/issue-controllers';

const router = Router();

router.route('/').post(isAuth, createIssueValidator, createIssue);
router.route('/:issueId/assign').patch(isAuth, assignValidator, assignUser);
router.route('/:issueId/label').patch(isAuth, addLabelValidator, addLabelOnIssue);
router
  .route('/:issueId/comment')
  .post(isAuth, commentValidator, commentOnIssue);

export default router;
