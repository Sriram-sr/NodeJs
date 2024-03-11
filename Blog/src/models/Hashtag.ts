import { Document, Schema, model } from 'mongoose';

interface HashtagDocument extends Document {
  tagName: string;
}

const hashtagSchema = new Schema<HashtagDocument>({
  tagName: {
    type: String,
    required: true
  }
});

export default model<HashtagDocument>('Hashtag', hashtagSchema);
