import { Document, Schema, model } from 'mongoose';
import { UserDocument } from './User';
import { TransactionDocument } from './Transaction';

export interface AccountDocument extends Document {
  user: UserDocument;
  type: 'savings' | 'current';
  balance: number;
  upiId: string;
  dateOpened: Date;
  dateClosed: Date;
  status: 'active' | 'inactive';
  transactions: Array<TransactionDocument>;
}

const accountSchema = new Schema<AccountDocument>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    type: {
      type: String,
      enum: ['savings', 'current'],
      required: true
    },
    balance: {
      type: Number,
      default: 0,
      required: true
    },
    upiId: {
      type: String,
      unique: true
    },
    dateOpened: {
      type: Date,
      required: true
    },
    dateClosed: Date,
    transactions: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Transaction'
      }
    ]
  },
  {
    timestamps: true
  }
);

export default model<AccountDocument>('Account', accountSchema);
