import { Document, Schema, model } from 'mongoose';
import { ProductDocument } from './Product';
import { BillTransactionDocument } from './BillTransaction';
import { OrderDocument } from './Order';

interface CartProduct {
  product: ProductDocument;
  quantity: {
    unit: string;
    items: number;
  };
  price: number;
}

export interface UserDocument extends Document {
  email: string;
  mobile: string;
  password: string;
  bonusPoints?: number;
  shoppingCart?: {
    products: Array<CartProduct>;
    totalPrice: number;
  };
  wishList?: Array<ProductDocument>;
  shoppingHistory?: Array<BillTransactionDocument | OrderDocument>;
  resetToken?: string;
  resetTokenExpiry?: Date;
}

const userSchema = new Schema<UserDocument>({
  email: {
    type: String,
    unique: true,
    required: true
  },
  mobile: {
    type: String,
    unique: true,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  bonusPoints: Number,
  shoppingCart: {
    products: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: 'Product',
          required: true
        },
        price: {
          type: Number,
          required: true
        },
        quantity: {
          unit: {
            type: String,
            required: true
          },
          items: {
            type: Number,
            required: true
          }
        }
      }
    ],
    totalPrice: Number
  },
  wishList: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Product'
    }
  ],
  shoppingHistory: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Order'
    }
  ],
  resetToken: String,
  resetTokenExpiry: Date
});

export default model<UserDocument>('User', userSchema);
