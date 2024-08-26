import { Router } from 'express';
import authRouter from './routes/auth-routes';
import projectRouter from './routes/project-routes';
import taskRouter from './routes/task-routes';

const router = Router();

router.use('/auth', authRouter);
router.use('/project', projectRouter);
router.use('/task', taskRouter);

export default router;
