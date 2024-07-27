import { Document, Types, Schema, model } from 'mongoose';

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
  activeProjects: Array<Types.ObjectId>;
  assignedTasks: Array<Types.ObjectId>;
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

export default User;
