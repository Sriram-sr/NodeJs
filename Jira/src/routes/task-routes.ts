import { Router } from 'express';
import { createTask, getTask } from '../controllers/task-controllers';
import { createTaskValidator } from '../validators/task-validators';
import { isAuth } from '../middlewares/is-auth';

const router = Router();

router.route('/').post(isAuth, createTaskValidator, createTask);
router.route('/:taskId').get(isAuth, getTask);

export default router;
