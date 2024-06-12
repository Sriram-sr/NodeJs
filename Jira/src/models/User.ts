import { Document, Schema, model } from 'mongoose';
import { randomBytes } from 'crypto';

interface Notification {
  category:
    | 'TaskAssignment'
    | 'TaskStatusChange'
    | 'TaskPriorityChange'
    | 'TaskDueDateChange'
    | 'TaskComment'
    | 'UserMention'
    | 'SprintStartEnd'
    | 'SprintDeadLine';
  status: 'read' | 'unread';
  message: string;
}

interface UserDocument extends Document {
  email: string;
  password: string;
  notifications: Array<Notification>;
  resetPasswordToken?: string;
  resetPasswordTokenExpiry?: Date;
}

const userSchema = new Schema<UserDocument>(
  {
    email: {
      type: String,
      unique: true,
      required: true
    },
    password: {
      type: String,
      required: true
    },
    notifications: [
      {
        message: {
          type: String,
          required: true
        },
        category: {
          type: String,
          required: true
        },
        status: {
          type: String,
          enum: ['read', 'unread'],
          required: true
        }
      }
    ],
    resetPasswordToken: String,
    resetPasswordTokenExpiry: Date
  },
  {
    timestamps: true
  }
);

const generateToken: (bytes: number) => Promise<string> = bytes => {
  return new Promise((resolve, reject) => {
    randomBytes(bytes, (err, buffer) => {
      if (err) {
        reject(err);
      }
      resolve(buffer.toString('hex'));
    });
  });
};

const User = model<UserDocument>('User', userSchema);

export { User, UserDocument, generateToken };
