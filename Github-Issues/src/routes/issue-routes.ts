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
  unassignUser,
  commentOnIssue,
  addLabelOnIssue,
  getLabelsOnIssue
} from '../controllers/issue-controllers';

const router = Router();

router.route('/').post(isAuth, createIssueValidator, createIssue);
router.route('/:issueId/assign').patch(isAuth, assignValidator, assignUser);
router
  .route('/:issueId/unassign')
  .delete(isAuth, assignValidator, unassignUser);
router
  .route('/:issueId/label')
  .get(getLabelsOnIssue)
  .patch(isAuth, addLabelValidator, addLabelOnIssue);
router
  .route('/:issueId/comment')
  .post(isAuth, commentValidator, commentOnIssue);

export default router;
