import { Router } from 'express';
import authRouter from './routes/auth-routes';
import productRouter from './routes/product-routes';
import cartRouter from './routes/cart-routes';
import { isAuth } from './middlewares/is-auth';
import { isAdminOrStaff } from './middlewares/common-middlewares';
import { billTransactionValidator } from './validators/product-validators';
import {
  getTransactions,
  createBillTransaction,
  placeOrder,
  getOrders,
  getSingleOrder,
  updateOrder,
  getSingleTransaction
} from './controllers/transaction-controllers';
import {
  createOrderValidator,
  updateOrderValidator,
  getTransactionsValidator
} from './validators/common-validators';

const router = Router();

router.use('/auth', authRouter);
router.use('/product', productRouter);
router.use('/cart', cartRouter);
router
  .route('/bill')
  .get(isAuth, isAdminOrStaff, getTransactionsValidator, getTransactions)
  .post(
    isAuth,
    isAdminOrStaff,
    billTransactionValidator,
    createBillTransaction
  );
router.route('/bill/:transactionId').get(getSingleTransaction);
router
  .route('/order')
  .get(isAuth, isAdminOrStaff, getTransactionsValidator, getOrders)
  .post(isAuth, createOrderValidator, placeOrder);
router
  .route('/order/:orderId')
  .get(getSingleOrder)
  .patch(isAuth, updateOrderValidator, updateOrder);
export default router;

// TODO: Show single bill transaction
// Get all bill transactions as a report.
