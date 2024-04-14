import { Document, Schema, model } from 'mongoose';
import { UserDocument } from './User';
import { OrderItem } from './Order';

export interface BillTransactionDocument extends Document {
  customer: UserDocument;
  items: Array<OrderItem>;
  totalPrice: number;
}

const billTransactionSchema = new Schema<BillTransactionDocument>({
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
}, {
  timestamps: true
});

export default model<BillTransactionDocument>(
  'BillTransaction',
  billTransactionSchema
);
