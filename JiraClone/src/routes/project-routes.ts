import { Router } from 'express';
import { isAuth } from '../middlewares/is-auth';
import {
  addMemberValidation,
  createProjectValidator,
  processJoinRequestValidator,
  projectIdValidator
} from '../validators/common-validators';
import {
  addMember,
  createProject,
  getJoinRequests,
  processJoinRequest,
  requestToJoin
} from '../controllers/project-controllers';

const router = Router();

router.route('/').post(isAuth, createProjectValidator, createProject);
router
  .route('/:projectId/add-member/:memberId')
  .post(isAuth, projectIdValidator, addMemberValidation, addMember);
router
  .route('/:projectId/request')
  .get(isAuth, projectIdValidator, getJoinRequests)
  .post(isAuth, projectIdValidator, requestToJoin);
router
  .route('/:projectId/request/:requestId/process')
  .put(isAuth, processJoinRequestValidator, processJoinRequest);

export default router;
