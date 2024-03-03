import { Document, Schema, model } from 'mongoose';
import { AccountDocument } from './Account';

export interface TransactionDocument extends Document {
  transactionId: string;
  debitedFrom: AccountDocument;
  creditedTo: AccountDocument;
  amount: number;
  type: 'debit' | 'credit' | 'transfer' | 'upi';
  description?: string;
}

const transactionSchema = new Schema<TransactionDocument>({
  transactionId: {
    type: String,
    unique: true,
    required: true
  },
  debitedFrom: {
    type: Schema.Types.ObjectId,
    ref: 'Account',
    required: true
  },
  creditedTo: {
    type: Schema.Types.ObjectId,
    ref: 'Account',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ['debit', 'credit', 'transfer', 'upi'],
    required: true
  },
  description: String
});

export default model<TransactionDocument>('Transaction', transactionSchema);