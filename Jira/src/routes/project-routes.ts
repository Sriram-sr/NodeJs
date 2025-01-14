import { Router } from 'express';
import { isAuth } from '../middlewares/is-auth';
import {
  createProjectValidator,
  projectRequestValidator,
  processJoinRequestValidator
} from '../validators/project-validators';
import {
  createProject,
  getJoinRequests,
  processJoinRequest,
  requestToJoinProject
} from '../controllers/project-controllers';

const router = Router();

router.route('/').post(isAuth, createProjectValidator, createProject);
router
  .route('/:projectId/request')
  .get(isAuth, getJoinRequests)
  .post(isAuth, projectRequestValidator, requestToJoinProject);
router
  .route('/:projectId/request/:requesterId/process')
  .put(isAuth, processJoinRequestValidator, processJoinRequest);

export default router;
