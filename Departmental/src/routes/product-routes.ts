import { Router } from 'express';
import { isAuth, isAdmin } from '../middlewares/is-auth';
import {
  addProductValidator,
  getProductsValidator,
  productIdValidator,
  updateProductvalidator
} from '../validators/product-validators';
import imageParser from '../middlewares/image-parser';
import {
  addCategory,
  getProducts,
  addProduct,
  deleteProduct,
  getSingleProduct,
  rateProduct,
  updateProduct,
  getCategories,
  addToWishlist,
  getWishlistedProducts
} from '../controllers/product-controllers';

const router = Router();

router.route('/category').get(getCategories).post(isAuth, isAdmin, addCategory);
router
  .route('/')
  .get(getProductsValidator, getProducts)
  .post(
    isAuth,
    isAdmin,
    imageParser.single('image'),
    addProductValidator,
    addProduct
  );
router.route('/wishlist').get(isAuth, getWishlistedProducts);
router
  .route('/:productId')
  .get(productIdValidator, getSingleProduct)
  .patch(isAuth, isAdmin, updateProductvalidator, updateProduct)
  .delete(isAuth, isAdmin, productIdValidator, deleteProduct);
router.route('/:productId/rating').post(isAuth, rateProduct);
router.route('/wishlist/:productId').post(isAuth, addToWishlist);

export default router;
