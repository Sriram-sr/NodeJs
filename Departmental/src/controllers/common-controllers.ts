import { RequestHandler } from 'express';
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
import User from '../models/User';

export const createBillTransaction: RequestHandler = async (
  req: customRequest,
  res,
  next
) => {
  const billingUser = await User.findById(req.userId);
  if (!(billingUser?.role === 'staff' || billingUser?.role === 'admin')) {
    return errorHandler(
      'Only staff or admins can initiate a bill transaction',
      HttpStatus.FORBIDDEN,
      next
    );
  }
  if (!validationResult(req).isEmpty()) {
    return validationHandler(validationResult(req).array(), next);
  }
  const { items, customer } = req.body as BillTransactionInput;

  let totalPrice = 0;
  for (const item of items) {
    const productPrice = item.qty * item.price;
    totalPrice += productPrice;
    const product = await Product.findById(item.product);
    if (product) product.unitsLeft -= item.qty;
    await product?.save();
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
};
