import { ValidationChain, body } from "express-validator";

/**
 *   productId: number;
  productName: string;
  description: string;
  category: Types.ObjectId;
  imageUrl?: string;
  unit: string;
  noOfUnits: number;
  pricePerUnit: number;
  expiryDate: Date;
  ratings?: Array<Rating>;
 */
export const addProductValidator: ValidationChain[] = [
    body('productName'), body('description'), body('category')
];
