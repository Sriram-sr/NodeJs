import { Document, Schema, model } from 'mongoose';

interface CounterDocument extends Document {
  modelName: string;
  field: string;
  count: number;
}

const counterSchema = new Schema<CounterDocument>({
  modelName: {
    type: String,
    required: true
  },
  field: {
    type: String,
    required: true
  },
  count: {
    type: Number,
    required: true
  }
});

const Counter = model<CounterDocument>('Counter', counterSchema);

const initialiseCounter: (model: string, field: string) => void = async (
  model,
  field
) => {
  const counter = await Counter.findOne({ modelName: model, field: field });
  if (!counter) {
    await Counter.create({ modelName: model, field: field, count: 0 });
  }
};

export default initialiseCounter;
