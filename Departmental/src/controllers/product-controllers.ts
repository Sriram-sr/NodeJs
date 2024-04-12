import { RequestHandler } from 'express';
import { validationResult } from 'express-validator';
import {
  HttpStatus,
  errorHandler,
  validationHandler
} from '../utils/error-handlers';
import Category from '../models/Category';
import { customRequest } from '../middlewares/is-auth';
import Product, { ProductInput } from '../models/Product';
import { Counter } from '../middlewares/mongoose-counter';

export const addCategory: RequestHandler = async (
  req: customRequest,
  res,
  next
) => {
  let { category: categoryName } = req.body as { category: string };
  categoryName =
    categoryName.trim().charAt(0).toUpperCase() + categoryName.trim().slice(1);
  const existingCategory = await Category.findOne({
    categoryName: categoryName
  });
  if (existingCategory) {
    return errorHandler(
      'Category with this name exists already',
      HttpStatus.CONFLICT,
      next
    );
  }
  if (categoryName.length < 5 || categoryName.length > 20) {
    return errorHandler(
      'Category name should not exceed 5 to 20 characters',
      HttpStatus.UNPROCESSABLE_ENTITY,
      next
    );
  }
  try {
    const category = await Category.create({
      categoryName:
        categoryName.trim().charAt(0).toUpperCase() +
        categoryName.trim().slice(1),
      products: []
    });

    res.status(HttpStatus.CREATED).json({
      message: 'Successfuly created a product category',
      category
    });
  } catch (err) {
    errorHandler(
      'Something went wrong, could not add category currently',
      HttpStatus.INTERNAL_SERVER_ERROR,
      next,
      err
    );
  }
};

export const addProduct: RequestHandler = async (
  req: customRequest,
  res,
  next
) => {
  if (!validationResult(req).isEmpty()) {
    return validationHandler(validationResult(req).array(), next);
  }
  const { productName, description, unit, unitsLeft, price, expiryDate } =
    req.body as ProductInput;
  try {
    const productCounter = await Counter.findOneAndUpdate(
      {
        modelName: 'Product',
        fieldName: 'productId'
      },
      { $inc: { count: 1 } },
      { new: true }
    );
    let imageUrl = '';
    if (req.file) {
      imageUrl = req.file.path;
    }
    const product = await Product.create({
      productId: productCounter?.count,
      productName,
      description,
      category: req.category?.categoryName,
      imageUrl,
      unit,
      unitsLeft,
      price,
      expiryDate
    });
    req.category?.products?.push(product._id);
    await req.category?.save();
    res.status(HttpStatus.CREATED).json({
      message: 'Succesfully added a product',
      product
    });
  } catch (err) {
    errorHandler(
      'Something went wrong, could not add product currently',
      HttpStatus.INTERNAL_SERVER_ERROR,
      next,
      err
    );
  }
};
