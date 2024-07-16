import { Router } from 'express';
import isAuth from '../middlewares/is-auth';
import {
  createTaskValidator,
  taskIdValidater
} from '../validators/task-validators';
import {
  assignTask,
  createTask,
  getSingleTask
} from '../controllers/task-controllers';

const router = Router();

router.route('/').post(isAuth, createTaskValidator, createTask);
router.route('/:taskId').get(taskIdValidater, getSingleTask);
router.route('/:taskId/assign').put(isAuth, taskIdValidater, assignTask);

export default router;
