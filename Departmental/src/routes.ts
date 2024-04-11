import { Router } from 'express';
import authRouter from './routes/auth-routes';
import productRouter from './routes/product-routes';

const router = Router();

router.use('/auth', authRouter);
router.use('/product', productRouter);

export default router;
