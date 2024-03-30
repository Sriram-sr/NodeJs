import { Document, Schema, model } from 'mongoose';
import { UserDocument } from './User';
import { PostDocument } from './Post';

export interface Reply {
  repliedBy: UserDocument;
  text: string;
}

export interface CommentDocument extends Document {
  post: PostDocument;
  commentedBy: UserDocument;
  text: string;
  likes: Array<UserDocument>;
  replies: Array<Reply>;
}

const commentSchema = new Schema<CommentDocument>({
  post: {
    type: Schema.Types.ObjectId,
    ref: 'Post',
    required: true
  },
  commentedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: true
  },
  likes: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  replies: [
    {
      repliedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      text: {
        type: String,
        required: true
      }
    }
  ]
});

export default model<CommentDocument>('Comment', commentSchema);
