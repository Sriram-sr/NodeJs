import { Document, Schema, model } from 'mongoose';
import { SprintDocument } from './Sprint';
import { UserDocument } from './User';
import { CommentDocument } from './Comment';
import { ProjectDocument } from './Project';

interface TaskDocument extends Document {
  taskId: string;
  title: string;
  description: string;
  status: 'Todo' | 'InProgress' | 'InReview' | 'Done';
  priority: 'High' | 'Medium' | 'Low';
  dueDate?: Date;
  creator: UserDocument;
  sprint: SprintDocument;
  project: ProjectDocument;
  assignee?: UserDocument;
  comments: Array<CommentDocument>;
}

export interface TaskInput {
  title: string;
  description: string;
  priority: string;
  dueDate?: Date;
  sprintId: SprintDocument;
  projectId: ProjectDocument;
  assignee?: UserDocument;
}

const taskSchema = new Schema<TaskDocument>(
  {
    taskId: {
      type: String,
      unique: true,
      required: true
    },
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
      default: null
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    sprint: {
      type: Schema.Types.ObjectId,
      ref: 'Sprint',
      required: true
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true
    },
    assignee: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null
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
