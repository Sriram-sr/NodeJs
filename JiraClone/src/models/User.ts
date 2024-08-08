import { Document, Schema, model } from 'mongoose';
import { randomBytes } from 'crypto';
import { ProjectDocument } from './Project';
import { TaskDocument } from './Task';

interface Notification {
  category:
    | 'TaskAssignment'
    | 'TaskStatusChange'
    | 'TaskPriorityChange'
    | 'TaskDueDateChange'
    | 'TaskComment'
    | 'UserMention'
    | 'SprintStartEnd'
    | 'SprintDeadLine'
    | 'General';
  message: string;
  isRead: boolean;
  createdAt: Date;
}

interface UserDocument extends Document {
  email: string;
  password: string;
  activeProjects: Array<ProjectDocument>;
  assignedTasks: Array<TaskDocument>;
  notifications: Array<Notification>;
  resetPasswordToken?: string;
  resetPasswordExpiry?: Date;
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
    activeProjects: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Project'
      }
    ],
    assignedTasks: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Task'
      }
    ],
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
    resetPasswordToken: String,
    resetPasswordExpiry: Date
  },
  {
    timestamps: true
  }
);

const User = model<UserDocument>('User', userSchema);

const generateToken = (bytes: number): Promise<string> => {
  return new Promise((resolve, reject) => {
    randomBytes(bytes, (err, buffer) => {
      if (err) {
        reject(err);
      } else {
        resolve(buffer.toString('hex'));
      }
    });
  });
};
export { User, UserDocument, generateToken };
