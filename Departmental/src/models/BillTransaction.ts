import { Document, Schema, model } from 'mongoose';
import { UserDocument, CartProduct } from './User';

export interface BillTransactionDocument extends Document {
  customer: UserDocument;
  items: Array<CartProduct>;
  totalPrice: number;
}

export interface BillTransactionInput {
  items: Array<CartProduct>;
  customer: UserDocument;
}

export interface TransactionsQuery {
  from?: Date;
  to?: Date;
  priceGreater?: number;
  priceLesser?: number;
  mobile?: string;
  page?: number;
}

export interface TransactionsFilter {
  customer?: UserDocument;
  user?: UserDocument;
  totalPrice?: { $gte?: number; $ltee?: number };
  createdAt?: { $gte?: Date; $lte?: Date };
}

const billTransactionSchema = new Schema<BillTransactionDocument>(
  {
    customer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    items: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: 'Product',
          required: true
        },
        qty: {
          type: Number,
          required: true
        },
        price: {
          type: Number,
          required: true
        }
      }
    ],
    totalPrice: {
      type: Number,
      required: true
    }
  },
  {
    timestamps: true
  }
);

export default model<BillTransactionDocument>(
  'BillTransaction',
  billTransactionSchema
);
