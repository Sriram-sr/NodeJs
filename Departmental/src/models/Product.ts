import { Document, Schema, Types, model } from 'mongoose';
import { UserDocument } from './User';

interface Rating {
  user: UserDocument;
  rating: number;
}

export interface ProductDocument extends Document {
  productId: number;
  productName: string;
  description: string;
  category: Types.ObjectId;
  imageUrl?: string;
  unit: string;
  noOfUnits: number;
  pricePerUnit: number;
  expiryDate: Date;
  ratings?: Array<Rating>;
}

const productSchema = new Schema<ProductDocument>({
  productId: {
    type: Number,
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  imageUrl: String,
  unit: {
    type: String,
    required: true
  },
  noOfUnits: {
    type: Number,
    default: 0,
    required: true
  },
  pricePerUnit: {
    type: Number,
    required: true
  },
  expiryDate: {
    type: Date,
    required: true
  },
  ratings: [
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: 'Category'
      },
      rating: {
        type: Number,
        min: 0.1,
        max: 5
      }
    }
  ]
});

export default model<ProductDocument>('Product', productSchema);
