import { Document, Schema, model } from 'mongoose';
import { SprintDocument } from './Sprint';
import { UserDocument } from './User';
import { CommentDocument } from './Comment';

interface TaskDocument extends Document {
  title: string;
  description: string;
  status: 'Todo' | 'InProgress' | 'InReview' | 'Done';
  priority: 'High' | 'Medium' | 'Low';
  dueDate: Date;
  sprint: SprintDocument;
  assignee: UserDocument;
  comments: Array<CommentDocument>;
}

const taskSchema = new Schema<TaskDocument>(
  {
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
      enum: ['Todo', 'InProgress', 'InReview', 'Done'],
      required: true
    },
    priority: {
      type: String,
      enum: ['High', 'Medium', 'Low'],
      required: true
    },
    dueDate: {
      type: Date,
      required: true
    },
    sprint: {
      type: Schema.Types.ObjectId,
      ref: 'Sprint',
      required: true
    },
    assignee: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Comment'
      }
    ]
  },
  {
    timestamps: true
  }
);

const Task = model<TaskDocument>('Task', taskSchema);

export { Task, TaskDocument };
