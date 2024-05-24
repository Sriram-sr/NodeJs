import { NextFunction, RequestHandler } from 'express';
import { validationResult } from 'express-validator';
import {
  HttpStatus,
  errorHandler,
  validationHandler
} from '../utils/error-handlers';
import BillTransaction, {
  BillTransactionInput,
  TransactionsQuery,
  TransactionsFilter
} from '../models/BillTransaction';
import Product from '../models/Product';
import { customRequest } from '../middlewares/is-auth';
import User, { CartProduct, UserDocument } from '../models/User';
import Order, { Address, OrderStatus } from '../models/Order';

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

const getTransactionFilters: (
  req: customRequest,
  isOrder?: boolean
) => TransactionsFilter = (req: customRequest, isOrder?: boolean) => {
  const { mobile, from, to, priceGreater, priceLesser } =
    req.query as TransactionsQuery;
  let filters: TransactionsFilter = {};
  if (mobile) {
    if (isOrder) {
      filters = { user: req.customer };
    } else {
      filters = { customer: req.customer };
    }
  }
  if (from || to) {
    let dateFilter: { $gte?: Date; $lte?: Date } = {};
    if (from) dateFilter.$gte = from;
    if (to) dateFilter.$lte = to;
    filters = { ...filters, createdAt: dateFilter };
  }
  if (priceGreater || priceLesser) {
    let priceFilter: { $gte?: number; $lte?: number } = {};
    if (priceGreater) {
      priceFilter.$gte = priceGreater;
    }
    if (priceLesser) {
      priceFilter.$lte = priceLesser;
    }
    filters = { ...filters, totalPrice: priceFilter };
  }

  return filters;
};

const getTransactions: RequestHandler = async (req, res, next) => {
  if (!validationResult(req).isEmpty()) {
    return validationHandler(validationResult(req).array(), next);
  }
  const { page } = req.query as { page?: number };
  const currentPage = page || 1;
  const perPage = 10;
  const filters = getTransactionFilters(req);

  try {
    const transactions = await BillTransaction.find(filters)
      .select('customer totalPrice createdAt')
      .populate({
        path: 'customer',
        select: 'mobile -_id'
      })
      .skip((currentPage - 1) * perPage)
      .limit(perPage);
    res.status(HttpStatus.OK).json({
      message: 'Successfully fetched bill transactions',
      transactions
    });
  } catch (err) {
    errorHandler(
      'Something went wrong, could not get transactions currently',
      HttpStatus.INTERNAL_SERVER_ERROR,
      next,
      err
    );
  }
};

const getSingleTransaction: RequestHandler = async (req, res, next) => {
  const { transactionId } = req.params as { transactionId: string };

  try {
    const transaction = await BillTransaction.findById(transactionId)
      .populate({
        path: 'customer',
        select: 'mobile -_id'
      })
      .populate({
        path: 'items',
        populate: {
          path: 'product',
          select: 'productName'
        }
      });
    res.status(HttpStatus.OK).json({
      message: 'Successfully fetched transaction',
      transaction
    });
  } catch (err) {
    errorHandler(
      'Something went wrong, could not get transaction currently',
      HttpStatus.INTERNAL_SERVER_ERROR,
      next,
      err
    );
  }
};

const createBillTransaction: RequestHandler = async (
  req: customRequest,
  res,
  next
) => {
  if (!validationResult(req).isEmpty()) {
    return validationHandler(validationResult(req).array(), next);
  }
  const { items, customer } = req.body as BillTransactionInput;

  try {
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

const placeOrder: RequestHandler = async (req: customRequest, res, next) => {
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
    user?.ordersHistory?.unshift(order._id);
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

const getOrders: RequestHandler = async (req, res, next) => {
  if (!validationResult(req).isEmpty()) {
    return validationHandler(validationResult(req).array(), next);
  }
  const { page } = req.query as { page?: number };
  const currentPage = page || 1;
  const perPage = 10;
  const filters = getTransactionFilters(req, true);

  try {
    const orders = await Order.find(filters)
      .select('user totalPrice orderStatus staffAssigned createdAt')
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

const getSingleOrder: RequestHandler = async (req, res, next) => {
  const { orderId } = req.params as { orderId: string };

  try {
    const order = await Order.findById(orderId)
      .populate({
        path: 'user',
        select: 'mobile -_id'
      })
      .populate({
        path: 'items',
        populate: {
          path: 'product',
          select: 'productName -_id category'
        }
      });
    res.status(HttpStatus.OK).json({
      message: 'Succesfully fetched order',
      order
    });
  } catch (err) {
    errorHandler(
      'Something went wrong, could not get order currently',
      HttpStatus.INTERNAL_SERVER_ERROR,
      next,
      err
    );
  }
};

const updateOrder: RequestHandler = async (req: customRequest, res, next) => {
  if (!validationResult(req).isEmpty()) {
    return validationHandler(validationResult(req).array(), next);
  }
  const { orderId } = req.params as { orderId: string };
  const { staff, status } = req.body as {
    staff?: UserDocument;
    status?: OrderStatus;
  };

  try {
    const updatingUser = await User.findById(req.userId);
    if (
      updatingUser?.role === 'customer' &&
      !(status && status === 'cancelled' && !staff)
    ) {
      return errorHandler(
        'Customer can only update the order with cancellation',
        HttpStatus.FORBIDDEN,
        next
      );
    }
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { staffAssigned: staff, orderStatus: status },
      {
        new: true
      }
    );
    res.status(HttpStatus.OK).json({
      message: 'Successfully updated the order',
      updatedOrder
    });
  } catch (err) {
    errorHandler(
      'Something went wrong, could not update order currently',
      HttpStatus.INTERNAL_SERVER_ERROR,
      next,
      err
    );
  }
};

export {
  getTransactions,
  getSingleTransaction,
  createBillTransaction,
  placeOrder,
  getOrders,
  getSingleOrder,
  updateOrder
};
