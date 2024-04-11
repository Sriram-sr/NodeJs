import { RequestHandler } from 'express';
import { HttpStatus, errorHandler } from '../utils/error-handlers';
import Category from '../models/Category';
import { customRequest } from '../middlewares/is-auth';

export const addCategory: RequestHandler = async (
  req: customRequest,
  res,
  next
) => {
  if (req.role !== 'admin') {
    return errorHandler(
      'Only admin can add product categories',
      HttpStatus.FORBIDDEN,
      next
    );
  }
  let { category: categoryName } = req.body as { category: string };
  console.log(categoryName);
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
};
