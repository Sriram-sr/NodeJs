import { Router } from 'express';
import {
  assignTask,
  createTask,
  getTask
} from '../controllers/task-controllers';
import {
  createTaskValidator,
  taskIdValidator
} from '../validators/task-validators';
import { isAuth } from '../middlewares/is-auth';

const router = Router();

router.route('/').post(isAuth, createTaskValidator, createTask);
router.route('/:taskId').get(isAuth, getTask);
router.route('/:taskId/assign').patch(isAuth, taskIdValidator, assignTask);

export default router;
