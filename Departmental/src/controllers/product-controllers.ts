import { RequestHandler } from 'express';
import { validationResult } from 'express-validator';
import {
  HttpStatus,
  errorHandler,
  validationHandler
} from '../utils/error-handlers';
import Category from '../models/Category';
import { customRequest } from '../middlewares/is-auth';
import Product, { ProductInput, ProductQuery } from '../models/Product';
import { Counter } from '../middlewares/mongoose-counter';

export const getCategories: RequestHandler = async (req, res, next) => {
  const { page } = req.query as { page?: number };
  const currentPage = page || 1;
  const perPage = 10;

  try {
    const categories = await Category.find()
      .select('categoryName -_id')
      .skip((currentPage - 1) * perPage)
      .limit(perPage);

    res.status(HttpStatus.OK).json({
      message: 'Successfully fetched product categories',
      categories
    });
  } catch (err) {
    errorHandler(
      'Something went wrong, could not get categories currently',
      HttpStatus.INTERNAL_SERVER_ERROR,
      next,
      err
    );
  }
};

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

export const getProducts: RequestHandler = async (req, res, next) => {
  if (!validationResult(req).isEmpty()) {
    return validationHandler(validationResult(req).array(), next);
  }
  const {
    productName,
    category,
    productId,
    unitsStart,
    unitsEnd,
    priceStart,
    priceEnd,
    ratingStart,
    ratingEnd,
    page,
    billSearch
  } = req.query as Partial<ProductQuery>;
  const currentPage = page || 1;
  const perPage = 10;

  let filters: any = {};
  if (productName)
    filters = { productName: { $regex: productName, $options: 'i' } };
  if (category) filters = { ...filters, category: category };
  if (productId) filters = { ...filters, productId: productId };
  if (unitsStart || unitsEnd) {
    let units: { $gte?: number; $lte?: number } = {};
    if (unitsStart) units.$gte = unitsStart;
    if (unitsEnd) units.$lte = unitsEnd;
    filters = { ...filters, unitsLeft: units };
  }
  if (priceStart || priceEnd) {
    let price: { $gte?: number; $lte?: number } = {};
    if (priceStart) price.$gte = priceStart;
    if (priceEnd) price.$lte = priceEnd;
    filters = { ...filters, price: price };
  }
  if (ratingStart || ratingEnd) {
    let rating: { $gte?: number; $lte?: number } = {};
    if (ratingStart) rating.$gte = ratingStart;
    if (ratingEnd) rating.$lte = ratingEnd;
    filters = { ...filters, overallRating: rating };
  }
  try {
    let products;
    if (billSearch === 'true') {
      products = await Product.find(filters)
        .select('productName price')
        .skip((currentPage - 1) * perPage)
        .limit(perPage);
    } else {
      products = await Product.find(filters)
        .skip((currentPage - 1) * perPage)
        .limit(perPage);
    }
    res.status(HttpStatus.OK).json({
      message: 'Successfully fetched products',
      products
    });
  } catch (err) {
    errorHandler(
      'Something went wrong, could not get products currently',
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

export const getSingleProduct: RequestHandler = async (req, res, next) => {
  if (!validationResult(req).isEmpty()) {
    return validationHandler(validationResult(req).array(), next);
  }
  const { productId } = req.params as { productId: string };

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return errorHandler(
        'Product not found with this Id',
        HttpStatus.NOT_FOUND,
        next
      );
    }
    res.status(HttpStatus.OK).json({
      message: 'Successfully fetched product',
      product
    });
  } catch (err) {
    errorHandler(
      'Something went wrong, could not get product currently',
      HttpStatus.INTERNAL_SERVER_ERROR,
      next,
      err
    );
  }
};

export const updateProduct: RequestHandler = async (req, res, next) => {
  if (!validationResult(req).isEmpty()) {
    return validationHandler(validationResult(req).array(), next);
  }
  const { productId } = req.params as { productId: string };

  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      req.body,
      {
        new: true
      }
    );
    res.status(HttpStatus.OK).json({
      message: 'Successfully updated product',
      updatedProduct
    });
  } catch (err) {
    errorHandler(
      'Something went wrong, could not update the product currently',
      HttpStatus.INTERNAL_SERVER_ERROR,
      next,
      err
    );
  }
};

export const deleteProduct: RequestHandler = async (req, res, next) => {
  if (!validationResult(req).isEmpty()) {
    return validationHandler(validationResult(req).array(), next);
  }
  const { productId } = req.params as { productId: string };

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return errorHandler(
        'Product not found with this Id',
        HttpStatus.NOT_FOUND,
        next
      );
    }
    await product.deleteOne();
    res.status(HttpStatus.OK).json({
      message: 'Successfully deleted product'
    });
  } catch (err) {
    errorHandler(
      'Something went wrong, could not delete the product currently',
      HttpStatus.INTERNAL_SERVER_ERROR,
      next,
      err
    );
  }
};

export const rateProduct: RequestHandler = async (
  req: customRequest,
  res,
  next
) => {
  const { productId } = req.params as { productId: string };
  const { ratings } = req.body as { ratings: number };
  if (!ratings) {
    return errorHandler(
      'Ratings is required',
      HttpStatus.UNPROCESSABLE_ENTITY,
      next
    );
  }
  if (ratings < 0 || ratings > 5) {
    return errorHandler(
      'Ratings value should be within 0.1 to 5',
      HttpStatus.UNPROCESSABLE_ENTITY,
      next
    );
  }

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return errorHandler(
        'Product not found with this Id',
        HttpStatus.NOT_FOUND,
        next
      );
    }

    const existingRating = product.ratings?.find(
      rating => rating.user.toString() === req.userId!.toString()
    );
    if (existingRating) {
      return errorHandler(
        'User already provided ratings for the product',
        HttpStatus.CONFLICT,
        next
      );
    }

    product.ratings?.push({ user: req.userId!, rating: ratings });
    const overallRating =
      product.ratings!.reduce((sum, rating) => sum + rating.rating, 0) /
      product.ratings!.length;
    product.overallRating = overallRating;
    const updatedProduct = await product.save();
    res.status(HttpStatus.OK).json({
      message: 'Successfully provided ratings for the product',
      updatedProduct
    });
  } catch (err) {
    errorHandler(
      'Something went wrong, could not provide ratings currently',
      HttpStatus.INTERNAL_SERVER_ERROR,
      next,
      err
    );
  }
};
