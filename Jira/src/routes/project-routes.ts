import { Router } from 'express';
import isAuth from '../middlewares/is-auth';
import {
  approveRequestValidator,
  createProjectValidator,
  createSprintValidator,
  joinRequestValidator,
  projectCodeValidator
} from '../validators/project-validators';
import {
  addProjectMember,
  approveJoinRequest,
  createProject,
  createSprint,
  getJoinRequests,
  removeProjectMember,
  requestToJoinProject
} from '../controllers/project-controllers';
import { checkProjectCreator } from '../middlewares/common-middlewares';

const router = Router();

router.route('/').post(isAuth, createProjectValidator, createProject);
router
  .route('/:projectCode/add-member')
  .post(isAuth, projectCodeValidator, checkProjectCreator, addProjectMember);
router
  .route('/:projectCode/remove-member')
  .delete(
    isAuth,
    projectCodeValidator,
    checkProjectCreator,
    removeProjectMember
  );
router
  .route('/:projectCode/request')
  .get(isAuth, projectCodeValidator, checkProjectCreator, getJoinRequests)
  .post(isAuth, joinRequestValidator, requestToJoinProject);
router
  .route('/:projectCode/request/approval')
  .put(
    isAuth,
    approveRequestValidator,
    checkProjectCreator,
    approveJoinRequest
  );
router
  .route('/:projectCode/sprint')
  .post(
    isAuth,
    projectCodeValidator,
    checkProjectCreator,
    createSprintValidator,
    createSprint
  );

export default router;
