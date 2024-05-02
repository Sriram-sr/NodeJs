import { RequestHandler } from 'express';
import {
  HttpStatus,
  errorHandler,
  validationHandler
} from '../utils/error-handlers';
import { validationResult } from 'express-validator';
import { customRequest } from '../middlewares/is-auth';
import User from '../models/User';
import { ProductDocument } from '../models/Product';

export const addToCart: RequestHandler = async (
  req: customRequest,
  res,
  next
) => {
  if (!validationResult(req).isEmpty()) {
    return validationHandler(validationResult(req).array(), next);
  }
  const { productId, price } = req.body as {
    productId: ProductDocument;
    price: number;
  };

  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return errorHandler(
        'User not authenticated',
        HttpStatus.UNAUTHORIZED,
        next
      );
    }
    const existingProductIdx = user?.shoppingCart?.products.findIndex(
      product => product.product.toString() === productId.toString()
    );
    if (existingProductIdx! >= 0) {
      user.shoppingCart!.products[existingProductIdx!].quantity += 1;
      user.shoppingCart!.totalPrice += +price;
    } else {
      user.shoppingCart?.products.unshift({
        product: productId,
        price: +price,
        quantity: 1
      });
      if (
        user.shoppingCart?.totalPrice &&
        user.shoppingCart?.totalPrice !== 0
      ) {
        user.shoppingCart!.totalPrice += +price;
      } else {
        user.shoppingCart!.totalPrice = +price;
      }
    }
    const updatedUser = await user.save();
    res.status(HttpStatus.OK).json({
      message: 'Successfully addded product to cart',
      cart: updatedUser.shoppingCart
    });
  } catch (err) {
    errorHandler(
      'Something went wrong, could not add to cart currently',
      HttpStatus.INTERNAL_SERVER_ERROR,
      next,
      err
    );
  }
};
