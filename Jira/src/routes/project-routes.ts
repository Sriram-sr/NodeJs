import { Router } from 'express';
import isAuth from '../middlewares/is-auth';
import {
  approveRequestValidator,
  createProjectValidator,
  joinRequestValidator
} from '../validators/common-validators';
import {
  approveJoinRequest,
  createProject,
  requestToJoinProject
} from '../controllers/project-controllers';

const router = Router();

router.route('/').post(isAuth, createProjectValidator, createProject);
router
  .route('/request')
  .post(isAuth, joinRequestValidator, requestToJoinProject);
router
  .route('/request/approval')
  .put(isAuth, approveRequestValidator, approveJoinRequest);

export default router;
