import { Document, Schema, model } from 'mongoose';

interface CounterDocument extends Document {
  modelName: string;
  count: number;
}

const counterSchema = new Schema<CounterDocument>({
  modelName: {
    type: String,
    required: true
  },
  count: {
    type: Number,
    required: true
  }
});

const Counter = model<CounterDocument>('Counter', counterSchema);

export const initializeCounter = async (modelName: string) => {
  const existingCounter = await Counter.findOne({ modelName: modelName });

  if (!existingCounter) {
    const counter = await Counter.create({ modelName: modelName, count: 1 });
  }
};
