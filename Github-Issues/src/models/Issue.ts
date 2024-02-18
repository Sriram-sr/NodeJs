import { Document, Schema, Types, model } from 'mongoose';
import { UserDocument } from './User';
import { Comment, PullRequestDocument } from './PullRequest';

export interface IssueDocument extends Document {
  title: string;
  description: string;
  status: string;
  createdBy: UserDocument;
  fixedBy: PullRequestDocument;
  events: Array<string>;
  labels: Array<Types.ObjectId>;
  assignees: Array<UserDocument>;
  milestone: Types.ObjectId;
  comments: Array<Comment>;
}

const issueSchema = new Schema<IssueDocument>(
  {
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    status: {
      type: String,
      required: true
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    fixedBy: {
      type: Schema.Types.ObjectId,
      ref: 'PullRequest'
    },
    events: [String],
    labels: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Label'
      }
    ],
    assignees: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    milestone: {
      type: Schema.Types.ObjectId,
      ref: 'Milestone'
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
        }
      }
    ]
  },
  {
    timestamps: true
  }
);

export default model<IssueDocument>('Issue', issueSchema);
