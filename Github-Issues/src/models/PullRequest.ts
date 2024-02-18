import { Document, Schema, model } from 'mongoose';
import { UserDocument } from './User';
import { IssueDocument } from './Issue';
import { LabelDocument } from './Label';

export type Comment = {
  text: string;
  commentedBy: UserDocument;
};

export interface PullRequestDocument extends Document {
  fixingIssue: IssueDocument;
  label: LabelDocument;
  status: string;
  events: Array<string>;
  comments: Array<Comment>;
  reviews: Array<UserDocument>;
}

const pullRequestSchema = new Schema<PullRequestDocument>(
  {
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
      required: true
    },
    events: [String],
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
