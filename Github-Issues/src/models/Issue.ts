import { Document, Schema, model } from 'mongoose';
import { UserDocument } from './User';
import { Comment, PullRequestDocument } from './PullRequest';
import { LabelDocument } from './Label';
import { MilestoneDocument } from './Milestone';

export interface IssueDocument extends Document {
  issueId: number;
  title: string;
  description: string;
  status: string;
  createdBy: UserDocument;
  fixedBy: PullRequestDocument;
  events: Array<string>;
  labels: Array<LabelDocument>;
  assignees: Array<UserDocument>;
  milestone: MilestoneDocument | undefined;
  comments: Array<Comment>;
}

export interface IssueInput {
  title: string;
  description: string;
  labels?: string[];
  assignees?: string[];
}

const issueSchema = new Schema<IssueDocument>(
  {
    issueId: {
      type: Number,
      required: true
    },
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
      enum: ['open', 'closed'],
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
