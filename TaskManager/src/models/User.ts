import mongoose, { Document, Schema } from 'mongoose';
import { TaskDocument } from './Task';

export interface UserDocument extends Document {
  username: string;
  email: string;
  password: string;
  resetToken?: string;
  resetTokenExpiry?: Date;
  assignedTasks: Array<TaskDocument>;
}

const userSchema = new Schema<UserDocument>(
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
    resetToken: String,
    resetTokenExpiry: Date,
    assignedTasks: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Task',
        required: true
      }
    ]
  },
  {
    timestamps: true
  }
);

export default mongoose.model<UserDocument>('User', userSchema);
