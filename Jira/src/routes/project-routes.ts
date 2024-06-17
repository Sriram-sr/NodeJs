import { Router } from 'express';
import isAuth from '../middlewares/is-auth';
import { createProjectValidator } from '../validators/common-validators';
import { createProject } from '../controllers/project-controllers';

const router = Router();

router.route('/').post(isAuth, createProjectValidator, createProject);

export default router;
