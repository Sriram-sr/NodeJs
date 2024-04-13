import { Document, Schema, model } from 'mongoose';
import { UserDocument } from './User';

interface Rating {
  user: UserDocument;
  rating: number;
}

export interface ProductInput {
  productName: string;
  description: string;
  category: string;
  unit: string;
  unitsLeft: number;
  price: number;
  expiryDate: Date;
}

export interface ProductDocument extends Document, ProductInput {
  productId: number;
  imageUrl?: string;
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
    type: String,
    required: true
  },
  imageUrl: String,
  unit: {
    type: String,
    required: true
  },
  unitsLeft: {
    type: Number,
    default: 0,
    required: true
  },
  price: {
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
}, {
  timestamps: true
});

export default model<ProductDocument>('Product', productSchema);
