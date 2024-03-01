import { Document, Schema, model } from 'mongoose';
import { UserDocument } from './User';
import { IssueDocument } from './Issue';
import { LabelDocument } from './Label';

export type Comment = {
  text: string;
  commentedBy: UserDocument;
  createdAt: Date;
};

export interface PullRequestDocument extends Document {
  prId: number;
  fixingIssue: IssueDocument;
  label: LabelDocument;
  status: string;
  events: Array<string>;
  createdBy: UserDocument;
  comments: Array<Comment>;
  reviews: Array<UserDocument>;
}

const pullRequestSchema = new Schema<PullRequestDocument>(
  {
    prId: {
      type: Number,
      unique: true,
      required: true
    },
    fixingIssue: {
      type: Schema.Types.ObjectId,
      ref: 'Issue',
      required: true
    },
    label: {
      type: Schema.Types.ObjectId,
      ref: 'Label',
      required: true
    },
    status: {
      type: String,
      enum: ['open', 'closed'],
      required: true
    },
    events: [String],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    comments: [
      {
        text: {
          type: String,
          required: true
        },
        commentedBy: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          required: true
        },
        createdAt: {
          type: Date,
          required: true
        }
      }
    ],
    reviews: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User'
      }
    ]
  },
  {
    timestamps: true
  }
);

export default model<PullRequestDocument>('PullRequest', pullRequestSchema);
