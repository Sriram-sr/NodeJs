import { Router } from 'express';
import isAuth from '../middlewares/is-auth';
import {
  createIssueValidator,
  assignValidator,
  commentValidator,
  addLabelValidator,
  issueIdValidator
} from '../validators/issue-validators';
import {
  getIssues,
  getSingleIssue,
  createIssue,
  assignUser,
  unassignUser,
  commentOnIssue,
  addLabelOnIssue,
  getLabelsOnIssue,
  closeIssue,
  reopenIssue,
  addMilestone,
  clearMilestone
} from '../controllers/issue-controllers';

const router = Router();

router
  .route('/')
  .get(getIssues)
  .post(isAuth, createIssueValidator, createIssue);
router.route('/:issueId').get(getSingleIssue);
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
router.route('/:issueId/close').patch(isAuth, issueIdValidator, closeIssue);
router.route('/:issueId/reopen').patch(isAuth, issueIdValidator, reopenIssue);
router
  .route('/:issueId/milestone')
  .patch(isAuth, issueIdValidator, addMilestone)
  .delete(isAuth, issueIdValidator, clearMilestone);

export default router;
