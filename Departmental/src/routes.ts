import { Router } from 'express';
import authRouter from './routes/auth-routes';
import productRouter from './routes/product-routes';
import cartRouter from './routes/cart-routes';
import { isAuth } from './middlewares/is-auth';
import { isAdminOrStaff } from './middlewares/common-middlewares';
import { billTransactionValidator } from './validators/product-validators';
import {
  createBillTransaction,
  placeOrder,
  getOrders
} from './controllers/common-controllers';
import { createOrderValidator } from './validators/common-validators';

const router = Router();

router.use('/auth', authRouter);
router.use('/product', productRouter);
router.use('/cart', cartRouter);
router
  .route('/bill')
  .post(
    isAuth,
    isAdminOrStaff,
    billTransactionValidator,
    createBillTransaction
  );
router
  .route('/order')
  .get(isAuth, isAdminOrStaff, getOrders)
  .post(isAuth, createOrderValidator, placeOrder);
export default router;
