import { Document, Schema, model } from 'mongoose';
import { AccountDocument } from './Account';

export interface UserDocument extends Document {
  email: string;
  mobile: string;
  password: string;
  resetToken?: string;
  resetTokenExpiry?: Date;
  firstName: string;
  lastName: string;
  role: 'admin' | 'customer';
  accounts: Array<AccountDocument>;
  primaryAccount: AccountDocument;
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
    resetToken: String,
    resetTokenExpiry: Date,
    firstName: {
      type: String,
      required: true
    },
    lastName: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ['admin', 'customer'],
      required: true
    },
    accounts: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Account'
      }
    ],
    primaryAccount: {
      type: Schema.Types.ObjectId,
      ref: 'Transaction'
    }
  },
  {
    timestamps: true
  }
);

export default model<UserDocument>('User', userSchema);
