import { NextFunction, RequestHandler } from 'express';
import { validationResult } from 'express-validator';
import {
  HttpStatus,
  errorHandler,
  validationHandler
} from '../utils/error-handlers';
import BillTransaction, {
  BillTransactionInput
} from '../models/BillTransaction';
import Product from '../models/Product';
import { customRequest } from '../middlewares/is-auth';
import User, { CartProduct } from '../models/User';
import Order, { Address } from '../models/Order';

const productQuantityHandler = async (
  items: Array<CartProduct>,
  next: NextFunction
): Promise<number | void> => {
  let totalPrice = 0;
  for (const item of items) {
    const productPrice = item.qty * item.price;
    totalPrice += productPrice;
    const product = await Product.findById(item.product);
    if (product) {
      if (!(product.unitsLeft - item.qty >= 0)) {
        return errorHandler(
          'Cannot select quantity larger than available stock',
          HttpStatus.BAD_REQUEST,
          next
        );
      }
      product.unitsLeft -= item.qty;
      await product?.save();
    }
  }
  return totalPrice;
};

export const createBillTransaction: RequestHandler = async (
  req: customRequest,
  res,
  next
) => {
  try {
    if (!validationResult(req).isEmpty()) {
      return validationHandler(validationResult(req).array(), next);
    }
    const { items, customer } = req.body as BillTransactionInput;

    let totalPrice = await productQuantityHandler(items, next);
    if (!totalPrice) {
      return;
    }
    const transaction = await BillTransaction.create({
      items,
      customer,
      totalPrice
    });
    const user = await User.findById(customer);
    user?.shoppingHistory?.unshift(transaction);
    await user?.save();
    res.status(HttpStatus.CREATED).json({
      message: 'Successfully created a bill transaction',
      transaction
    });
  } catch (err) {
    errorHandler(
      'Something went wrong, could not proceed this transaction currently',
      HttpStatus.INTERNAL_SERVER_ERROR,
      next,
      err
    );
  }
};

export const placeOrder: RequestHandler = async (
  req: customRequest,
  res,
  next
) => {
  if (!validationResult(req).isEmpty()) {
    return validationHandler(validationResult(req).array(), next);
  }
  const { houseNo, street, city, zip, landmark } = req.body as Address;

  try {
    const user = await User.findById(req.userId);
    const userCart = user?.shoppingCart?.products;
    if (userCart && !(userCart.length >= 1)) {
      return errorHandler(
        'User cart is empty, could not place order',
        HttpStatus.BAD_REQUEST,
        next
      );
    }
    const totalPrice = await productQuantityHandler(
      user?.shoppingCart?.products!,
      next
    );
    if (!totalPrice) {
      return;
    }
    const order = await Order.create({
      user: req.userId,
      items: userCart,
      totalPrice: user?.shoppingCart?.totalPrice,
      shippingInfo: {
        houseNo,
        street,
        city,
        zip,
        landmark
      }
    });
    user!.shoppingCart = {
      products: [],
      totalPrice: 0
    };
    user?.shoppingHistory?.unshift(order._id);
    await user?.save();
    res.status(HttpStatus.CREATED).json({
      message: 'Successfully created order',
      order
    });
  } catch (err) {
    errorHandler(
      'Something went wrong, could not place order currently',
      HttpStatus.INTERNAL_SERVER_ERROR,
      next,
      err
    );
  }
};

export const getOrders: RequestHandler = async (req, res, next) => {
  const { page } = req.query as { page?: number };
  const currentPage = page || 1;
  const perPage = 10;
  try {
    const orders = await Order.find()
      .select('user totalPrice orderStatus staffAssigned')
      .populate({
        path: 'user',
        select: 'mobile -_id'
      })
      .skip((currentPage - 1) * perPage)
      .limit(perPage);
    res.status(HttpStatus.OK).json({
      message: 'Successfully fetched orders',
      orders
    });
  } catch (err) {
    errorHandler(
      'Something went wrong, could not get orders currently',
      HttpStatus.INTERNAL_SERVER_ERROR,
      next,
      err
    );
  }
};

// TODO
// export const getSingleOrder: RequestHandler = (req, res, next) => {}
