import { Router } from 'express';
import isAuth from '../middlewares/is-auth';
import {
  approveRequestValidator,
  createProjectValidator,
  joinRequestValidator,
  projectCodeValidator
} from '../validators/common-validators';
import {
  approveJoinRequest,
  createProject,
  getJoinRequests,
  requestToJoinProject
} from '../controllers/project-controllers';

const router = Router();

router.route('/').post(isAuth, createProjectValidator, createProject);
router
  .route('/:projectCode/request')
  .get(isAuth, projectCodeValidator, getJoinRequests)
  .post(isAuth, joinRequestValidator, requestToJoinProject);
router
  .route('/:projectCode/request/approval')
  .put(isAuth, approveRequestValidator, approveJoinRequest);

export default router;
