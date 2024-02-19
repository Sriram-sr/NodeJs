import { Router } from 'express';
import isAuth from '../middlewares/is-auth';
import { createIssueValidator } from '../validators/common-validators';
import { createIssue } from '../controllers/issue-controllers';

const router = Router();

router.route('/').post(isAuth, createIssueValidator, createIssue);

export default router;
