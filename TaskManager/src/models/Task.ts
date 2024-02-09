import mongoose, { Document, Schema, Types, Model } from 'mongoose';
import { LabelDocument } from './Label';
import { UserDocument } from './User';

interface Comment {
  text: string;
  commentedBy: Types.ObjectId;
  date: Date;
}

export interface TaskDocument extends Document {
  title: string;
  description: string;
  status: string;
  labels: Array<LabelDocument>;
  createdBy: UserDocument;
  assignedTo: UserDocument | null;
  createdDate: Date;
  dueDate: Date;
  completionDate: Date;
  lastUpdatedDate: string;
  comments: Array<Comment>;
  collaborators: Array<UserDocument>;
  visibility: string;
}

interface TaskInput {
  title: string;
  description: string;
  labels: Array<string>;
  dueDate: Date;
  visibility: string;
}

const taskSchema = new Schema<TaskDocument>({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['completed', 'in-progress', 'unassigned', 'assigned'],
    default: 'unassigned',
    required: true
  },
  labels: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Label',
      required: true
    }
  ],
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  createdDate: {
    type: Date,
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  completionDate: {
    type: Date,
    required: true
  },
  lastUpdatedDate: Date,
  comments: [
    {
      text: String,
      commentedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      date: Date
    }
  ],
  collaborators: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  ],
  visibility: {
    type: String,
    enum: ['public', 'private'],
    required: true
  }
});

const Task: Model<TaskDocument> = mongoose.model<TaskDocument>(
  'Task',
  taskSchema
);

export { Task, TaskInput };
