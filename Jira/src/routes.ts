import { Router } from 'express';
import authRouter from './routes/auth-routes';
import projectRouter from './routes/project-routes';

const router = Router();

router.use('/auth', authRouter);
router.use('/project', projectRouter);

export default router;
