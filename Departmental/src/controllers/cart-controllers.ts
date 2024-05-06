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

export const getCart: RequestHandler = async (
  req: customRequest,
  res,
  next
) => {
  try {
    const user = await User.findById(req.userId)
      .select('shoppingCart')
      .populate({
        path: 'shoppingCart.products.product',
        select: 'productName imageUrl category'
      });

    res.status(HttpStatus.OK).json({
      message: 'Successfully fetched shopping cart',
      cart: user?.shoppingCart
    });
  } catch (err) {
    errorHandler(
      'Something went wrong, could not get cart currently',
      HttpStatus.INTERNAL_SERVER_ERROR,
      next,
      err
    );
  }
};

export const addToCart: RequestHandler = async (
  req: customRequest,
  res,
  next
) => {
  if (!validationResult(req).isEmpty()) {
    return validationHandler(validationResult(req).array(), next);
  }
  const { productId } = req.params as { productId?: ProductDocument };
  const { price } = req.body as {
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
      product => product.product.toString() === productId!.toString()
    );
    if (existingProductIdx! >= 0) {
      user.shoppingCart!.products[existingProductIdx!].qty += 1;
      user.shoppingCart!.totalPrice += +price;
    } else {
      user.shoppingCart?.products.unshift({
        product: productId!,
        price: +price,
        qty: 1
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

export const incrementCartProductQty: RequestHandler = async (
  req: customRequest,
  res,
  next
) => {
  const { productId } = req.params as { productId: string };

  try {
    const user = await User.findById(req.userId);
    const existingProduct = user?.shoppingCart?.products.find(
      product => product.product.toString() === productId
    );
    if (!existingProduct) {
      return errorHandler(
        'Product not present in cart to increment quantity',
        HttpStatus.BAD_REQUEST,
        next
      );
    }
    existingProduct.qty += 1;
    user!.shoppingCart!.totalPrice += existingProduct.price;
    const updatedUser = await user?.save();
    res.status(HttpStatus.OK).json({
      message: 'Successfully incremented cart product quantity',
      updatedCart: updatedUser?.shoppingCart
    });
  } catch (err) {
    errorHandler(
      'Something went wrong, could not increment quantity currently',
      HttpStatus.INTERNAL_SERVER_ERROR,
      next,
      err
    );
  }
};

export const decrementCartProductQty: RequestHandler = async (
  req: customRequest,
  res,
  next
) => {
  const { productId } = req.params as { productId: string };

  try {
    const user = await User.findById(req.userId);
    const existingProductIdx = user?.shoppingCart?.products.findIndex(
      product => product.product.toString() === productId
    );
    if (!(existingProductIdx! >= 0)) {
      return errorHandler(
        'Product not present in cart to decrement quantity',
        HttpStatus.BAD_REQUEST,
        next
      );
    }
    const priceToDeduct =
      user?.shoppingCart?.products[existingProductIdx!].price;
    if (user?.shoppingCart?.products[existingProductIdx!].qty === 1) {
      user.shoppingCart.products.splice(existingProductIdx!, 1);
    } else {
      user!.shoppingCart!.products[existingProductIdx!].qty -= 1;
    }
    user!.shoppingCart!.totalPrice -= priceToDeduct!;
    const updatedUser = await user?.save();
    res.status(HttpStatus.OK).json({
      message: 'Successfully decremented cart product quantity',
      updatedCart: updatedUser?.shoppingCart
    });
  } catch (err) {
    errorHandler(
      'Something went wrong, could not decrement quantity currently',
      HttpStatus.INTERNAL_SERVER_ERROR,
      next,
      err
    );
  }
};

export const removeFromCart: RequestHandler = async (
  req: customRequest,
  res,
  next
) => {
  const { productId } = req.params as { productId: string };

  try {
    const user = await User.findById(req.userId);
    const existingProductIdx = user?.shoppingCart?.products.findIndex(
      product => product.product.toString() === productId
    );
    if (!(existingProductIdx! >= 0)) {
      return errorHandler(
        'Product not present in cart to remove',
        HttpStatus.BAD_REQUEST,
        next
      );
    }
    user!.shoppingCart!.totalPrice -=
      user!.shoppingCart!.products[existingProductIdx!].price *
      user!.shoppingCart!.products[existingProductIdx!].qty;
    user?.shoppingCart?.products.splice(existingProductIdx!, 1);
    const updatedUser = await user?.save();
    res.status(HttpStatus.OK).json({
      message: 'Sucessfully removed product from cart',
      updatedCart: updatedUser?.shoppingCart
    });
  } catch (err) {
    errorHandler(
      'Something went wrong, could not remove product currently',
      HttpStatus.INTERNAL_SERVER_ERROR,
      next,
      err
    );
  }
};

export const clearCart: RequestHandler = async (
  req: customRequest,
  res,
  next
) => {
  try {
    const user = await User.findById(req.userId);
    user!.shoppingCart = {
      products: [],
      totalPrice: 0
    };
    await user?.save();
    res.status(HttpStatus.OK).json({
      message: 'Successfully cleared shopping cart'
    });
  } catch (err) {
    errorHandler(
      'Something went wrong, could not clear cart currently',
      HttpStatus.INTERNAL_SERVER_ERROR,
      next,
      err
    );
  }
};
