import { Router } from 'express';
import authRouter from './routes/auth-routes';
import postRouter from './routes/post-routes';

const router = Router();

router.use('/auth', authRouter); // TODO Strong Authentication
router.use('/post', postRouter);

export default router;
