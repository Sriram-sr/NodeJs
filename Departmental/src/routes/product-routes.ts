import { Router } from 'express';
import { isAuth, isAdmin } from '../middlewares/is-auth';
import {
  addProductValidator,
  productIdValidator,
  updateProductvalidator
} from '../validators/common-validators';
import imageParser from '../middlewares/image-parser';
import {
  addCategory,
  addProduct,
  deleteProduct,
  getProduct,
  rateProduct,
  updateProduct
} from '../controllers/product-controllers';

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
router
  .route('/:productId')
  .get(productIdValidator, getProduct)
  .patch(isAuth, isAdmin, updateProductvalidator, updateProduct)
  .delete(isAuth, isAdmin, productIdValidator, deleteProduct);
  router.route('/:productId/rating').post(isAuth, rateProduct);

export default router;
