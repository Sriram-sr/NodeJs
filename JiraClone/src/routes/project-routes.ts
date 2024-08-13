import { Router } from 'express';
import { isAuth } from '../middlewares/is-auth';
import {
  createProjectValidator,
  projectIdValidator
} from '../validators/common-validators';
import {
  createProject,
  getJoinRequests,
  requestToJoin
} from '../controllers/project-controllers';

const router = Router();

router.route('/').post(isAuth, createProjectValidator, createProject);
router
  .route('/:projectId/request')
  .get(isAuth, projectIdValidator, getJoinRequests)
  .post(isAuth, projectIdValidator, requestToJoin);

export default router;
