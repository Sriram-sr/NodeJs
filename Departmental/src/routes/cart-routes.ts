import { Router } from 'express';
import { addToCartValidator } from '../validators/common-validators';
import { addToCart } from '../controllers/cart-controllers';
import { isAuth } from '../middlewares/is-auth';

const router = Router();

router.route('/').post(isAuth, addToCartValidator, addToCart);

export default router;
