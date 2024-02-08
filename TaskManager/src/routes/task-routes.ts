import { Router } from 'express';
import isAuth from '../middlewares/is-auth';
import { createTaskValidator } from '../validators/task-validators';
import { createTask, assignTask } from '../controllers/task-controllers';
import { param, body } from 'express-validator';

const router = Router();

const validateMongoId = [
  param('taskId').isMongoId().withMessage('Task Id is invalid Mongo Id'),
  body('userId')
    .notEmpty()
    .withMessage('User Id is required')
    .isMongoId()
    .withMessage('User Id is invalid Mongo Id')
];

router.route('/').post(isAuth, createTaskValidator, createTask);
router.route('/:taskId/assign').post(isAuth, validateMongoId, assignTask);

export default router;
