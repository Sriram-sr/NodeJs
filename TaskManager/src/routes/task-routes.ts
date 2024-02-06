import { Router } from 'express';
import isAuth from '../middlewares/is-auth';
import { createTask } from '../controllers/task-controllers';

const router = Router();

router.route('/').post(isAuth, createTask);

export default router;
