import { Document, Schema, model } from 'mongoose';
import { PostDocument } from './Post';

interface HashtagDocument extends Document {
  tagName: string;
  posts: Array<PostDocument>;
}

const hashtagSchema = new Schema<HashtagDocument>({
  tagName: {
    type: String,
    required: true
  },
  posts: [{
    type: Schema.Types.ObjectId,
    ref: 'Post',
    required: true
  }]
});

export default model<HashtagDocument>('Hashtag', hashtagSchema);
