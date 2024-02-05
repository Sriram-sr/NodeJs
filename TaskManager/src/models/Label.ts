import mongoose, { Document, Schema } from 'mongoose';

export interface LabelDocument extends Document {
  labelName: string;
  description: string;
  color: string;
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
  color: {
    type: String,
    required: true
  }
});

export default mongoose.model<LabelDocument>('Label', labelSchema);
