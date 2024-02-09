import { Router } from 'express';
import isAuth from '../middlewares/is-auth';
import { createTaskValidator } from '../validators/task-validators';
import {
  validateTaskId,
  validateUserId
} from '../middlewares/task-middlewares';
import {
  createTask,
  assignTask,
  unassignTask
} from '../controllers/task-controllers';

const router = Router();

router.route('/').post(isAuth, createTaskValidator, createTask);
router
  .route('/:taskId/assign')
  .post(isAuth, validateTaskId, validateUserId, assignTask);
router
  .route('/:taskId/unassign')
  .delete(isAuth, validateTaskId, validateUserId, unassignTask);

export default router;
