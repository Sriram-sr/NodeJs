import { Document, Schema, model } from 'mongoose';
import { UserDocument } from './User';

export interface LabelDocument extends Document {
  labelName: string;
  description: string;
  apReviewers: Array<UserDocument>;
}

const labelSchema = new Schema<LabelDocument>({
  labelName: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  apReviewers: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  ]
});

export default model<LabelDocument>('Label', labelSchema);
