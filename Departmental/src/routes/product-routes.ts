import { Router } from 'express';
import { addCategory } from '../controllers/product-controllers';
import isAuth from '../middlewares/is-auth';

const router = Router();

router.route('/category').post(isAuth, addCategory);

export default router;
