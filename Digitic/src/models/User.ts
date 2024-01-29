import mongoose, { Document, Schema } from 'mongoose';

interface UserProto extends Document {
  username: string;
  email: string;
  password: string;
  role: string;
  resetToken: string;
  resetTokenExpiry: Date;
}

const userSchema = new Schema<UserProto>(
  {
    username: {
      type: String,
      required: true,
      unique: true
    },
    email: {
      type: String,
      required: true
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ['admin', 'customer'],
      required: true
    },
    resetToken: String,
    resetTokenExpiry: Date
  },
  {
    timestamps: true
  }
);

export default mongoose.model<UserProto>('User', userSchema);
