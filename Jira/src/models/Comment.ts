import { Document, Schema, Types } from 'mongoose';
import { UserDocument } from './User';

interface CommentDocument extends Document {
  user: UserDocument;
  task: Types.ObjectId;
  content: string;
}

const commentSchema = new Schema<CommentDocument>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  task: {
    type: Schema.Types.ObjectId,
    ref: 'Task',
    required: true
  },
  content: {
    type: String,
    required: true
  }
});

export { commentSchema };
