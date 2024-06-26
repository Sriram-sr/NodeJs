import { Document, Schema, model } from 'mongoose';
import { ProjectDocument } from './Project';
import { TaskDocument } from './Task';
import { UserDocument } from './User';

interface SprintDocument extends Document {
  sprintId: string;
  title: string;
  startDate: Date;
  endDate: Date;
  goal: string;
  creator: UserDocument;
  project: ProjectDocument;
  tasks: Array<TaskDocument>;
}

const sprintSchema = new Schema<SprintDocument>(
  {
    sprintId: {
      type: String,
      unique: true,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    goal: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
);

const Sprint = model<SprintDocument>('Sprint', sprintSchema);

export { Sprint, SprintDocument };
