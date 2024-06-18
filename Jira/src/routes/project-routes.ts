import { Router } from 'express';
import isAuth from '../middlewares/is-auth';
import {
  createProjectValidator,
  joinRequestValidator
} from '../validators/common-validators';
import {
  createProject,
  requestToJoinProject
} from '../controllers/project-controllers';

const router = Router();

router.route('/').post(isAuth, createProjectValidator, createProject);
router
  .route('/request')
  .post(isAuth, joinRequestValidator, requestToJoinProject);

export default router;
