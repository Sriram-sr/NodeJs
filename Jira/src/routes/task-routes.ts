import { Router } from 'express';
import isAuth from '../middlewares/is-auth';
import { createTaskValidator } from '../validators/task-validators';
import { createTask } from '../controllers/task-controllers';

const router = Router();

router.route('/').post(isAuth, createTaskValidator, createTask);

export default router;
