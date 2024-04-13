import { Document, Schema, model } from 'mongoose';
import { ProductDocument } from './Product';
import { BillTransactionDocument } from './BillTransaction';
import { OrderDocument } from './Order';
import { sign } from 'jsonwebtoken';
import { JWTSECUREKEY } from '../utils/env-variables';
import { randomBytes } from 'crypto';

export type UserRole = 'admin' | 'staff' | 'customer';

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
  role: UserRole;
  bonusPoints?: number;
  shoppingCart?: {
    products: Array<CartProduct>;
    totalPrice: number;
  };
  wishList?: Array<ProductDocument>;
  shoppingHistory?: Array<BillTransactionDocument | OrderDocument>;
  resetToken?: string;
  resetTokenExpiry?: Date;
  getJwtToken: (expiry: string) => string;
}

const userSchema = new Schema<UserDocument>(
  {
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
    role: {
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
  },
  {
    timestamps: true
  }
);

userSchema.methods.getJwtToken = function (expiry: string): string {
  return sign({ userId: this._id, role: this.role }, JWTSECUREKEY, {
    expiresIn: expiry
  });
};

export const generateToken = (bytes: number): Promise<string> => {
  return new Promise((resolve, reject) => {
    randomBytes(bytes, (err, buffer) => {
      if (err) {
        reject(err);
      } else {
        resolve(buffer.toString('hex'));
      }
    });
  });
};

export default model<UserDocument>('User', userSchema);
