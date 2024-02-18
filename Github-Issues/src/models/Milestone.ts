import { Document, Schema, model } from 'mongoose';

interface MilestoneDocument extends Document {
  title: string;
  description: string;
  dueDate: Date;
}

const milestoneSchema = new Schema<MilestoneDocument>({
  title: {
    type: String,
    unique: true,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  }
});

export default model<MilestoneDocument>('Milestone', milestoneSchema);
