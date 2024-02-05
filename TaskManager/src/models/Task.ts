import mongoose, { Document, Schema, Types } from 'mongoose';
import { LabelDocument } from './Label';
import { UserDocument } from './User';

interface Comment {
  text: string;
  commentedBy: Types.ObjectId;
  date: Date;
}

interface TaskDocument extends Document {
  title: string;
  description: string;
  status: string;
  labels: Array<LabelDocument>;
  createdBy: Types.ObjectId;
  assignedTo: Types.ObjectId;
  createdDate: Date;
  dueDate: Date;
  completionDate: Date;
  lastUpdatedDate: string;
  comments: Array<Comment>;
  collaborators: Array<UserDocument>;
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
    enum: ['completed', 'in-progress', 'unassigned'],
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
    ref: 'User',
    required: true
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

export default mongoose.model<TaskDocument>('Task', taskSchema);
