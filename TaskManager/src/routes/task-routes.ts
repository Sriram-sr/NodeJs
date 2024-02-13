import { Router } from 'express';
import { param } from 'express-validator';
import isAuth from '../middlewares/is-auth';
import {
  createTaskValidator,
  commentOnTaskValidator
} from '../validators/task-validators';
import {
  validateTaskId,
  validateUserId,
  validateLabelId,
  validateTaskStatus
} from '../middlewares/task-middlewares';
import {
  getTasks,
  getTaskDetails,
  createTask,
  updateTaskStatus,
  assignTask,
  unassignTask,
  collaborateTask,
  removeCollaboratorFromTask,
  commentOnTask,
  addLabelToTask,
  removeLabelFromTask
} from '../controllers/task-controllers';

const router = Router();

router.route('/').get(getTasks).post(isAuth, createTaskValidator, createTask);
router
  .route('/:taskId')
  .get(
    param('taskId').isMongoId().withMessage('Task Id is a invalid mongo Id'),
    isAuth,
    getTaskDetails
  );
router
  .route('/:taskId/assign')
  .post(isAuth, validateTaskId, validateUserId, assignTask);
router
  .route('/:taskId/unassign')
  .delete(isAuth, validateTaskId, validateUserId, unassignTask);
router
  .route('/:taskId/collaborator')
  .post(isAuth, validateTaskId, validateUserId, collaborateTask);
router
  .route('/:taskId/collaborator')
  .delete(isAuth, validateTaskId, validateUserId, removeCollaboratorFromTask);
router
  .route('/:taskId/comment')
  .post(isAuth, validateTaskId, commentOnTaskValidator, commentOnTask);
router
  .route('/:taskId/label/:labelId')
  .patch(isAuth, validateLabelId, validateTaskId, addLabelToTask)
  .delete(isAuth, validateLabelId, validateTaskId, removeLabelFromTask);
router
  .route('/status/:taskId')
  .patch(isAuth, validateTaskStatus, validateTaskId, updateTaskStatus);

export default router;
