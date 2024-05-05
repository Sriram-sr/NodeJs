import { Router } from 'express';
import { addToCartValidator } from '../validators/common-validators';
import {
  getCart,
  addToCart,
  incrementCartProductQty,
  decrementCartProductQty,
  removeFromCart,
  clearCart
} from '../controllers/cart-controllers';
import { isAuth } from '../middlewares/is-auth';

const router = Router();

router.route('/').get(isAuth, getCart).delete(isAuth, clearCart);
router.route('/add/:productId').post(isAuth, addToCartValidator, addToCart);
router.route('/remove/:productId').delete(isAuth, removeFromCart);
router.route('/increment/:productId').put(isAuth, incrementCartProductQty);
router.route('/decrement/:productId').put(isAuth, decrementCartProductQty);

export default router;
