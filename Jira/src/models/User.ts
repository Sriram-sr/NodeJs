import { Document, model, Schema } from 'mongoose';
import { randomBytes } from 'crypto';
import { ProjectDocument } from './Project';

interface Notification {
  category:
    | 'General'
    | 'SprintCreation'
    | 'SprintDeadline'
    | 'TaskAssignment'
    | 'UserMention';
  message: string;
  isRead: boolean;
  createdAt: Date;
}

interface UserDocument extends Document {
  email: string;
  password: string;
  notifications: Array<Notification>;
  activeProjects: Array<ProjectDocument>;
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
        category: {
          type: String,
          required: true
        },
        message: {
          type: String,
          required: true
        },
        isRead: {
          type: Boolean,
          default: false,
          required: true
        },
        createdAt: {
          type: Date,
          required: true
        }
      }
    ],
    activeProjects: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: 'Project'
        }
      ],
      default: []
    },
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
