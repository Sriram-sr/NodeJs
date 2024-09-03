import { Router } from 'express';
import { isAuth } from '../middlewares/is-auth';
import {
  memberIdValidation,
  createProjectValidator,
  processJoinRequestValidator,
  projectIdValidator,
  createSprintValidator
} from '../validators/project-validators';
import {
  addMember,
  createProject,
  getJoinRequests,
  processJoinRequest,
  removeMember,
  requestToJoin,
  createSprint,
  getSprint
} from '../controllers/project-controllers';
import { checkProjectCreator } from '../middlewares/common-middlewares';

const router = Router();

router.route('/').post(isAuth, createProjectValidator, createProject);
router
  .route('/:projectId/add-member/:memberId')
  .post(
    isAuth,
    projectIdValidator,
    memberIdValidation,
    checkProjectCreator,
    addMember
  );
router
  .route('/:projectId/remove-member/:memberId')
  .delete(
    isAuth,
    projectIdValidator,
    memberIdValidation,
    checkProjectCreator,
    removeMember
  );
router
  .route('/:projectId/request')
  .get(isAuth, projectIdValidator, checkProjectCreator, getJoinRequests)
  .post(isAuth, projectIdValidator, requestToJoin);
router
  .route('/:projectId/request/:requestId/process')
  .put(
    isAuth,
    processJoinRequestValidator,
    checkProjectCreator,
    processJoinRequest
  );
router
  .route('/:projectId/sprint')
  .post(
    isAuth,
    projectIdValidator,
    checkProjectCreator,
    createSprintValidator,
    createSprint
  );
router
  .route('/:projectId/sprint/:sprintId')
  .get(isAuth, projectIdValidator, getSprint);

export default router;
