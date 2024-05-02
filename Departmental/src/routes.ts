import { Router } from 'express';
import authRouter from './routes/auth-routes';
import productRouter from './routes/product-routes';
import cartRouter from './routes/cart-routes';
import { isAuth } from './middlewares/is-auth';
import { billTransactionValidator } from './validators/product-validators';
import { createBillTransaction } from './controllers/common-controllers';

const router = Router();

router.use('/auth', authRouter);
router.use('/product', productRouter);
router.use('/cart', cartRouter);
router
  .route('/bill')
  .post(isAuth, billTransactionValidator, createBillTransaction);

export default router;
