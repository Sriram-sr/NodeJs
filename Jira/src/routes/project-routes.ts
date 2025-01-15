import { Router } from 'express';
import { isAuth } from '../middlewares/is-auth';
import {
  projectIdValidator,
  createProjectValidator,
  requestToJoinValidator,
  processJoinRequestValidator
} from '../validators/project-validators';
import { isProjectCreator } from '../middlewares/project-middlewares';
import {
  createProject,
  getJoinRequests,
  processJoinRequest,
  requestToJoinProject,
  addMemberToProject,
  deleteMemberFromProject
} from '../controllers/project-controllers';

const router = Router();

router.route('/').post(isAuth, createProjectValidator, createProject);
router
  .route('/:projectId/request')
  .get(isAuth, projectIdValidator, isProjectCreator, getJoinRequests)
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
    isProjectCreator,
    processJoinRequest
  );
router
  .route('/:projectId/add-member/:memberId')
  .post(isAuth, projectIdValidator, isProjectCreator, addMemberToProject);
router
  .route('/:projectId/remove-member/:memberId')
  .delete(
    isAuth,
    projectIdValidator,
    isProjectCreator,
    deleteMemberFromProject
  );

export default router;
