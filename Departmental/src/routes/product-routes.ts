import { Router } from 'express';
import { isAuth, isAdmin } from '../middlewares/is-auth';
import { addProductValidator } from '../validators/common-validators';
import imageParser from '../middlewares/image-parser';
import { addCategory, addProduct } from '../controllers/product-controllers';

const router = Router();

router.route('/category').post(isAuth, isAdmin, addCategory);
router
  .route('/')
  .post(
    isAuth,
    isAdmin,
    imageParser.single('image'),
    addProductValidator,
    addProduct
  );

export default router;
