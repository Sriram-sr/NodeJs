import { Document, Schema, model } from 'mongoose';
import { PostDocument } from './Post';

interface Activity {
  activity: string;
  post: PostDocument;
}

export interface UserDocument extends Document {
  email: string;
  username: string;
  password: string;
  profilePic: string;
  about: string;
  posts: Array<PostDocument>;
  repostCount: number;
  following: Array<UserDocument>;
  followers: Array<UserDocument>;
  lastActivities: Array<Activity>;
}

export interface UserInput {
  email?: string;
  username?: string;
  password: string;
}

const userSchema = new Schema<UserDocument>({
  email: {
    type: String,
    unique: true,
    required: true
  },
  username: {
    type: String,
    unique: true,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  profilePic: String,
  about: String,
  posts: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Post'
    }
  ],
  repostCount: Number,
  following: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  followers: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  lastActivities: [
    {
      activity: {
        type: String,
        required: true
      },
      post: {
        type: Schema.Types.ObjectId,
        ref: 'Post',
        required: true
      }
    }
  ]
});

export default model<UserDocument>('User', userSchema);
