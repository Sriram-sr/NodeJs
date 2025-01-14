import { Router } from 'express';
import { isAuth } from '../middlewares/is-auth';
import {
  projectIdValidator,
  createProjectValidator,
  requestToJoinValidator,
  processJoinRequestValidator
} from '../validators/project-validators';
import {
  addMemberToProject,
  createProject,
  getJoinRequests,
  processJoinRequest,
  requestToJoinProject
} from '../controllers/project-controllers';

const router = Router();

router.route('/').post(isAuth, createProjectValidator, createProject);
router
  .route('/:projectId/request')
  .get(isAuth, projectIdValidator, getJoinRequests)
  .post(
    isAuth,
    projectIdValidator,
    requestToJoinValidator,
    requestToJoinProject
  );
router
  .route('/:projectId/request/:requesterId/process')
  .put(
    isAuth,
    projectIdValidator,
    processJoinRequestValidator,
    processJoinRequest
  );
router
  .route('/:projectId/add-member/:memberId')
  .post(isAuth, addMemberToProject);

export default router;
