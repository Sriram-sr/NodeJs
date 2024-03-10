import { Document, Types, Schema, model } from 'mongoose';

interface Activity {
  activity: string;
  post: Types.ObjectId;
}

interface UserDocument extends Document {
  email: string;
  username: string;
  password: string;
  profilePic: string;
  about: string;
  following: Array<Types.ObjectId>;
  followers: Array<Types.ObjectId>;
  lastActivities: Array<Activity>;
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
