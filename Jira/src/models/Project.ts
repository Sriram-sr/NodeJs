import { Document, Schema, model } from 'mongoose';
import { UserDocument } from './User';
import { SprintDocument } from './Sprint';

interface JoinRequest {
  requester: UserDocument;
  reason: string;
  status: 'Requested' | 'Approved' | 'Declined';
}

interface ProjectDocument extends Document {
  projectCode: string;
  title: string;
  description: string;
  visibility: 'public' | 'private';
  creator: UserDocument;
  members: Array<UserDocument>;
  joinRequests: Array<JoinRequest>;
  sprints: Array<SprintDocument>;
}

const projectSchema = new Schema<ProjectDocument>(
  {
    projectCode: {
      type: String,
      unique: true,
      required: true
    },
    title: {
      type: String,
      unique: true,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    visibility: {
      type: String,
      default: 'public',
      required: true
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    joinRequests: [
      {
        requester: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          required: true
        },
        reason: {
          type: String,
          required: true
        },
        status: {
          type: String,
          enum: ['Requested', 'Approved', 'Declined'],
          required: true
        }
      }
    ],
    sprints: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Sprint'
      }
    ]
  },
  {
    timestamps: true
  }
);

const Project = model<ProjectDocument>('Project', projectSchema);

export { Project, ProjectDocument };
