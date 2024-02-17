import { Document, Schema, model } from 'mongoose';

export interface UserDocument extends Document {
  email: string;
  username: string;
  password: string;
  resetToken: string;
  resetTokenExpiry: Date;
}

const userSchema = new Schema<UserDocument>(
  {
    email: {
      type: String,
      unique: true,
      required: true
    },
    username: {
      type: String,
      unique: true,
      required: true
    },
    password: {
      type: String,
      required: true
    },
    resetToken: String,
    resetTokenExpiry: Date
  },
  {
    timestamps: true
  }
);

export default model<UserDocument>('User', userSchema);
