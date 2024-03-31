import { Document, Schema, model } from 'mongoose';
import { UserDocument } from './User';
import { CommentDocument } from './Comment';

export interface PostDocument extends Document {
  title: string;
  content: string;
  imageUrl: string;
  creator: UserDocument;
  likes: Array<UserDocument>;
  comments: Array<CommentDocument>;
}

const postSchema = new Schema<PostDocument>({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  imageUrl: String,
  creator: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  likes: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  comments: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Comment'
    }
  ]
});

export default model<PostDocument>('Post', postSchema);
