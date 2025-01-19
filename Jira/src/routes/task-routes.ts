import { Router } from 'express';
import { createTask } from '../controllers/task-controllers';
import { createTaskValidator } from '../validators/task-validators';
import { isAuth } from '../middlewares/is-auth';

const router = Router();

router.route('/').post(isAuth, createTaskValidator, createTask);

export default router;
