import { Document, Types, Schema, model } from 'mongoose';
import { UserDocument } from './User';

export interface PostDocument extends Document {
  title: string;
  content: string;
  imageUrl: string;
  creator: UserDocument;
  likes: Array<UserDocument>;
  comments: Array<Types.ObjectId>;
  reposts: Array<UserDocument>;
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
  ],
  reposts: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  ]
});

export default model<PostDocument>('Post', postSchema);
