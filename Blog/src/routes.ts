import { Router } from 'express';
import authRouter from './routes/auth-routes';
import userRouter from './routes/user-routes';
import postRouter from './routes/post-routes';

const router = Router();

router.use('/auth', authRouter); // TODO Strong Authentication
router.use('/post', postRouter);
router.use('/user', userRouter);

export default router;
