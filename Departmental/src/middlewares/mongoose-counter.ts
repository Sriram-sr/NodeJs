import { Document, Schema, model } from 'mongoose';

interface CounterDocument extends Document {
  modelName: string;
  fieldName: string;
  count: number;
}

const counterSchema = new Schema<CounterDocument>({
  modelName: {
    type: String,
    required: true
  },
  fieldName: {
    type: String,
    required: true
  },
  count: {
    type: Number,
    required: true
  }
});

const Counter = model<CounterDocument>('Counter', counterSchema);

export const initializeCounter = async (modelName: string, field: string) => {
  const existingCounter = await Counter.findOne({
    modelName: modelName,
    fieldName: field
  });

  if (!existingCounter) {
    await Counter.create({ modelName: modelName, fieldName: field, count: 1 });
  }
};
