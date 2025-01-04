import { Router } from 'express';
import { isAuth } from '../middlewares/is-auth';
import {
  createProjectValidator,
  projectRequestValidator
} from '../validators/project-validators';
import {
  createProject,
  requestToJoinProject
} from '../controllers/project-controllers';

const router = Router();

router.route('/').post(isAuth, createProjectValidator, createProject);
router
  .route('/:projectId/request')
  .post(isAuth, projectRequestValidator, requestToJoinProject);

export default router;
